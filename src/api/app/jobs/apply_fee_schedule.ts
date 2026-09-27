import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import type { SerializedLock } from '@adonisjs/lock/types'

import lockManager from '@adonisjs/lock/services/main'
import db from '@adonisjs/lucid/services/db'

import AcademicPeriod from '#models/academic_period'
import FeeSchedule from '#models/fee_schedule'
import FeeStudentLedger from '#models/fee_student_ledger'
import SchoolClass from '#models/school_class'
import SchoolStudent from '#models/school_student'
import StudentClassEnrollment from '#models/student_class_enrollment'

interface ApplyFeeSchedulePayload {
  feeScheduleId: string
  lock: SerializedLock
  user: {
    id: string
    fullName: string
    email: string
  }
}

function breakdownsEqual(
  first: Record<string, number> | null,
  second: Record<string, number> | null
): boolean {
  if (first === null || second === null) {
    return first === second
  }

  const firstKeys = Object.keys(first).sort()
  const secondKeys = Object.keys(second).sort()

  if (firstKeys.length !== secondKeys.length) {
    return false
  }

  return firstKeys.every((key, index) => {
    const secondKey = secondKeys[index]

    if (key !== secondKey) {
      return false
    }

    return first[key] === second[key]
  })
}

export default class ApplyFeeSchedule extends Job<ApplyFeeSchedulePayload> {
  static options: JobOptions = {
    queue: 'default',
    maxRetries: 3,
  }

  async execute() {
    const { feeScheduleId, lock: serializedLock, user } = this.payload

    const lock = lockManager.restoreLock(serializedLock)

    try {
      await db.transaction(async (trx) => {
        /**
         * Load the current fee schedule inside the transaction.
         * The fee schedule is the source of truth for the ledger
         * amount and breakdown.
         */
        const feeSchedule = await FeeSchedule.query({ client: trx })
          .where('id', feeScheduleId)
          .first()

        if (!feeSchedule) {
          throw new Error('Fee schedule not found.')
        }

        /**
         * We need the academic year because student enrollment
         * is scoped to the academic year.
         */
        const academicPeriod = await AcademicPeriod.query({
          client: trx,
        })
          .where('id', feeSchedule.academicPeriodId)
          .first()

        if (!academicPeriod) {
          throw new Error('Academic period not found.')
        }

        /**
         * A parent class applies to its child/variant classes.
         * A normal class applies only to itself.
         */
        const childClasses = await SchoolClass.query({
          client: trx,
        })
          .where('parent_id', feeSchedule.classId)
          .select('id')

        const targetClassIds =
          childClasses.length > 0
            ? childClasses.map((schoolClass) => schoolClass.id)
            : [feeSchedule.classId]

        /**
         * Find active enrollments for the academic year
         * belonging to the classes covered by the schedule.
         */
        const enrollments = await StudentClassEnrollment.query({
          client: trx,
        })
          .where('school_id', feeSchedule.schoolId)
          .whereIn('class_id', targetClassIds)
          .where('academic_year_id', academicPeriod.academicYearId)
          .where('status', 'active')
          .select(['student_id', 'class_id'])

        /**
         * If nobody currently matches this schedule,
         * there is simply nothing to create/update.
         */
        if (enrollments.length === 0) {
          await this.markApplied(feeSchedule, user, 0, 0, trx)

          return
        }

        /**
         * Keep the actual enrollment class attached to the
         * student's ledger.
         */
        const enrollmentClassMap = new Map(
          enrollments.map((enrollment) => [enrollment.studentId, enrollment.classId])
        )

        const studentIds = enrollments.map((enrollment) => enrollment.studentId)

        /**
         * Only students whose residential status matches
         * the accommodation type of this fee schedule.
         */
        const students = await SchoolStudent.query({
          client: trx,
        })
          .whereIn('id', studentIds)
          .where('residential_status', feeSchedule.accommodationType)
          .select('id')

        if (students.length === 0) {
          await this.markApplied(feeSchedule, user, 0, 0, trx)

          return
        }

        const matchingStudentIds = students.map((student) => student.id)

        /**
         * IMPORTANT:
         *
         * We only look for ledgers belonging to THIS fee schedule.
         *
         * A student can have multiple fee schedules in the
         * same academic period, for example:
         *
         *   Day ledger
         *   Boarding ledger
         *
         * Therefore academic_period_id alone is not sufficient.
         */
        const ledgers = await FeeStudentLedger.query({
          client: trx,
        })
          .where('school_id', feeSchedule.schoolId)
          .where('fee_schedule_id', feeSchedule.id)
          .whereIn('student_id', matchingStudentIds)

        const ledgerMap = new Map(ledgers.map((ledger) => [ledger.studentId, ledger]))

        const newLedgers: Array<{
          schoolId: string
          studentId: string
          feeScheduleId: string
          academicPeriodId: string
          classId: string
          accommodationType: 'day' | 'boarding'
          amount: number
          amountPaid: number
          paymentStatus: 'paid' | 'unpaid'
          breakdown: Record<string, number> | null
        }> = []

        let updatedCount = 0

        for (const student of students) {
          const classId = enrollmentClassMap.get(student.id)

          if (!classId) {
            continue
          }

          const ledger = ledgerMap.get(student.id)

          /**
           * No ledger for this fee schedule:
           * create one.
           */
          if (!ledger) {
            newLedgers.push({
              schoolId: feeSchedule.schoolId,
              studentId: student.id,
              feeScheduleId: feeSchedule.id,
              academicPeriodId: feeSchedule.academicPeriodId,
              classId,
              accommodationType: feeSchedule.accommodationType as any,
              amount: feeSchedule.amount,
              amountPaid: 0,
              paymentStatus: feeSchedule.amount === 0 ? 'paid' : 'unpaid',
              breakdown: feeSchedule.breakdown,
            })

            continue
          }

          /**
           * Existing ledger:
           * determine exactly what needs reconciliation.
           */
          const amountChanged = ledger.amount !== feeSchedule.amount

          const breakdownChanged = !breakdownsEqual(ledger.breakdown, feeSchedule.breakdown)

          const classChanged = ledger.classId !== classId

          const accommodationChanged = ledger.accommodationType !== feeSchedule.accommodationType

          if (amountChanged || breakdownChanged || classChanged || accommodationChanged) {
            ledger.merge({
              classId,
              accommodationType: feeSchedule.accommodationType,
              amount: feeSchedule.amount,
              breakdown: feeSchedule.breakdown,
            })

            await ledger.save()

            updatedCount++
          }
        }

        /**
         * Batch-create all missing ledgers.
         */
        if (newLedgers.length > 0) {
          await FeeStudentLedger.createMany(newLedgers, { client: trx })
        }

        /**
         * Record application metadata only after the
         * reconciliation has completed successfully.
         */
        await this.markApplied(feeSchedule, user, newLedgers.length, updatedCount, trx)

        console.log('Fee schedule applied', {
          feeScheduleId: feeSchedule.id,
          studentCount: students.length,
          created: newLedgers.length,
          updated: updatedCount,
          user,
        })
      })
    } finally {
      /**
       * The serialized lock belongs to this job execution.
       * Always release it, including on failure.
       */
      await lock.release()
    }
  }

  private async markApplied(
    feeSchedule: FeeSchedule,
    user: ApplyFeeSchedulePayload['user'],
    created: number,
    updated: number,
    trx: any
  ) {
    const appliedAt = new Date().toISOString()

    const action = feeSchedule.meta?.lastAppliedAt ? 'reapplied' : 'applied'

    const changeLogs = Array.isArray(feeSchedule.changeLogs) ? [...feeSchedule.changeLogs] : []

    changeLogs.push({
      action,
      at: appliedAt,
      user,
      studentCount: created + updated,
      created,
      updated,
    })

    feeSchedule.meta = JSON.stringify({
      ...(feeSchedule.meta ?? {}),
      lastAppliedAt: appliedAt,
    })

    feeSchedule.changeLogs = JSON.stringify(changeLogs)

    feeSchedule.useTransaction(trx)

    await feeSchedule.save()
  }

  async failed(error: Error) {
    console.error(
      `Fee schedule application failed for ${this.payload.feeScheduleId}:`,
      error.message
    )
  }
}
