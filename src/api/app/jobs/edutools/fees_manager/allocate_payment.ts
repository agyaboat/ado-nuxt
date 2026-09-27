import { DateTime } from 'luxon'
import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'

import db from '@adonisjs/lucid/services/db'

import FeePaymentAllocation from '#models/fee_payment_allocation'
import FeePaymentRecord from '#models/fee_payment_record'
import FeeStudentLedger from '#models/fee_student_ledger'
import FeeStudentOldArrear from '#models/fee_student_old_arrear'
import FeeStudentOldArrearSettlement from '#models/fee_student_old_arrear_settlement'

interface AllocatePaymentPayload {
  paymentId: string
}

export default class AllocatePayment extends Job<AllocatePaymentPayload> {
  static options: JobOptions = {
    queue: 'default',
    maxRetries: 3,
  }

  async execute() {
    const { paymentId } = this.payload
    const trx = await db.transaction()

    try {
      /*
       * Lock the payment so it cannot be allocated concurrently.
       */
      const payment = await FeePaymentRecord.query({ client: trx })
        .where('id', paymentId)
        .forUpdate()
        .first()

      if (!payment) {
        await trx.rollback()
        return
      }

      /*
       * Idempotency guard.
       *
       * Once allocation has completed, this payment must never
       * be allocated again.
       */
      if (payment.allocationCompletedAt) {
        await trx.commit()
        return
      }

      let remainingAmount = Number(payment.amount)

      /*
       * ============================================================
       * 1. SETTLE PREVIOUS / OLD ARREARS FIRST
       * ============================================================
       *
       * There is at most one old-arrears record per student.
       *
       * The remaining old arrears is:
       *
       *     arrear.amount - SUM(settlements.amount)
       *
       * The arrear itself is locked while we calculate and create
       * the settlement to prevent concurrent payments from settling
       * the same balance.
       */
      if (remainingAmount > 0) {
        const oldArrear = await FeeStudentOldArrear.query({
          client: trx,
        })
          .where('school_id', payment.schoolId)
          .where('student_id', payment.studentId)
          .forUpdate()
          .first()

        if (oldArrear) {
          const settlements = await FeeStudentOldArrearSettlement.query({
            client: trx,
          })
            .where('fee_student_old_arrear_id', oldArrear.id)
            .select(['amount'])

          const settledAmount = settlements.reduce(
            (total, settlement) => total + Number(settlement.amount),
            0
          )

          const oldArrearBalance = Math.max(Number(oldArrear.amount) - settledAmount, 0)

          if (oldArrearBalance > 0) {
            const settlementAmount = Math.min(remainingAmount, oldArrearBalance)

            await FeeStudentOldArrearSettlement.create(
              {
                feeStudentOldArrearId: oldArrear.id,
                feePaymentRecordId: payment.id,
                amount: settlementAmount,
                settledAt: DateTime.now(),
              },
              { client: trx }
            )

            remainingAmount -= settlementAmount
          }
        }
      }

      /*
       * ============================================================
       * 2. ALLOCATE REMAINING PAYMENT TO ACADEMIC FEE LEDGERS
       * ============================================================
       *
       * Academic ledgers are ordered chronologically:
       *
       *     oldest academic year
       *     → oldest period
       *
       * This ensures the remaining payment settles the oldest
       * academic obligation first.
       */
      if (remainingAmount > 0) {
        const ledgers = await FeeStudentLedger.query({
          client: trx,
        })
          .where('fee_student_ledgers.school_id', payment.schoolId)
          .where('fee_student_ledgers.student_id', payment.studentId)
          .whereRaw('fee_student_ledgers.amount > fee_student_ledgers.amount_paid')
          .join('academic_periods', 'academic_periods.id', 'fee_student_ledgers.academic_period_id')
          .orderBy('academic_periods.starts_at', 'asc')
          .orderBy('academic_periods.sort_order', 'asc')
          .select('fee_student_ledgers.*')
          .forUpdate()

        for (const ledger of ledgers) {
          if (remainingAmount <= 0) {
            break
          }

          const balance = Math.max(Number(ledger.amount) - Number(ledger.amountPaid), 0)

          if (balance <= 0) {
            continue
          }

          const allocationAmount = Math.min(remainingAmount, balance)

          await FeePaymentAllocation.create(
            {
              feePaymentRecordId: payment.id,
              feeStudentLedgerId: ledger.id,
              amount: allocationAmount,
            },
            { client: trx }
          )

          ledger.amountPaid = Number(ledger.amountPaid) + allocationAmount

          ledger.paymentStatus = ledger.amountPaid >= Number(ledger.amount) ? 'paid' : 'partial'

          await ledger.save()

          remainingAmount -= allocationAmount
        }
      }

      /*
       * ============================================================
       * 3. COMPLETE PAYMENT ALLOCATION
       * ============================================================
       *
       * Any amount left after previous arrears and academic ledgers
       * is genuinely unallocated.
       */
      const completedAt = DateTime.now()

      payment.meta = {
        ...(payment.meta ?? {}),
        allocation: {
          status: 'completed',
          unallocatedAmount: remainingAmount,
          completedAt: completedAt.toISO(),
        },
      }

      payment.allocationCompletedAt = completedAt

      await payment.save()

      await trx.commit()
    } catch (error) {
      await trx.rollback()

      console.error(`Payment allocation failed for ${paymentId}:`, error)

      throw error
    }
  }
}
