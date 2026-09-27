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

export default class ApplyFeeScheduleC extends Job<ApplyFeeSchedulePayload> {
  static options: JobOptions = {
    queue: 'default',
    maxRetries: 3,
  }

  async execute() {
    const { feeScheduleId, lock: serializedLock, user } = this.payload

    const lock = lockManager.restoreLock(serializedLock)

    try {
      await db.transaction(async (trx) => {
        const feeSchedule = await FeeSchedule.query({ client: trx })
          .where('id', feeScheduleId)
          .first()

        if (!feeSchedule) {
          throw new Error('Fee schedule not found.')
        }

        const academicPeriod = await AcademicPeriod.query({ client: trx })
          .where('id', feeSchedule.academicPeriodId)
          .first()

        if (!academicPeriod) {
          throw new Error('Academic period not found.')
        }

        const childClasses = await SchoolClass.query({ client: trx })
          .where('parent_id', feeSchedule.classId)
          .select('id')

        const targetClassIds =
          childClasses.length > 0
            ? childClasses.map((schoolClass) => schoolClass.id)
            : [feeSchedule.classId]

        const enrollments = await StudentClassEnrollment.query({
          client: trx,
        })
          .where('school_id', feeSchedule.schoolId)
          .whereIn('class_id', targetClassIds)
          .where('academic_year_id', academicPeriod.academicYearId)
          .where('status', 'active')
          .select(['student_id', 'class_id'])

        if (enrollments.length === 0) {
          const lastAppliedAt = new Date().toISOString()

          feeSchedule.meta = JSON.stringify({
            ...(feeSchedule.meta ?? {}),
            lastAppliedAt,
          })

          await feeSchedule.save()

          return
        }

        const enrollmentClassMap = new Map(
          enrollments.map((enrollment) => [enrollment.studentId, enrollment.classId])
        )

        const studentIds = enrollments.map((enrollment) => enrollment.studentId)

        const students = await SchoolStudent.query({ client: trx })
          .whereIn('id', studentIds)
          .where('residential_status', feeSchedule.accommodationType)
          .select('id')

        if (students.length === 0) {
          const lastAppliedAt = new Date().toISOString()

          feeSchedule.meta = JSON.stringify({
            ...(feeSchedule.meta ?? {}),
            lastAppliedAt,
          })

          await feeSchedule.save()

          return
        }

        const matchingStudentIds = students.map((student) => student.id)

        const ledgers = await FeeStudentLedger.query({ client: trx })
          .where('school_id', feeSchedule.schoolId)
          .where('academic_period_id', feeSchedule.academicPeriodId)
          .whereIn('student_id', matchingStudentIds)

        const ledgerMap = new Map(ledgers.map((ledger) => [ledger.studentId, ledger]))

        const newLedgers = []

        for (const student of students) {
          const classId = enrollmentClassMap.get(student.id)

          if (!classId) {
            continue
          }

          const ledger = ledgerMap.get(student.id)

          if (ledger) {
            ledger.feeScheduleId = feeSchedule.id
            ledger.classId = classId
            ledger.accommodationType = feeSchedule.accommodationType
            ledger.amount = feeSchedule.amount
            ledger.breakdown = feeSchedule.breakdown

            await ledger.save()

            continue
          }

          newLedgers.push({
            schoolId: feeSchedule.schoolId,
            studentId: student.id,
            feeScheduleId: feeSchedule.id,
            academicPeriodId: feeSchedule.academicPeriodId,
            classId,
            accommodationType: feeSchedule.accommodationType,
            amount: feeSchedule.amount,
            amountPaid: 0,
            paymentStatus: feeSchedule.amount === 0 ? 'paid' : 'unpaid',
            breakdown: feeSchedule.breakdown,
          })
        }

        if (newLedgers.length) {
          await FeeStudentLedger.createMany(newLedgers, {
            client: trx,
          })
        }

        const lastAppliedAt = new Date().toISOString()
        const action = feeSchedule.meta?.lastAppliedAt ? 'reapplied' : 'applied'

        const changeLogs = Array.isArray(feeSchedule.changeLogs) ? feeSchedule.changeLogs : []

        changeLogs.push({
          action,
          at: lastAppliedAt,
          user,
          studentCount: students.length,
          created: newLedgers.length,
          updated: ledgers.length,
        })

        feeSchedule.meta = JSON.stringify({
          ...(feeSchedule.meta ?? {}),
          lastAppliedAt,
        })

        feeSchedule.changeLogs = JSON.stringify(changeLogs)

        await feeSchedule.save()

        console.log('Fee schedule applied', {
          feeScheduleId: feeSchedule.id,
          studentCount: students.length,
          created: newLedgers.length,
          updated: ledgers.length,
          user,
        })
      })
    } finally {
      await lock.release()
    }
  }

  async failed(error: Error) {
    console.error(
      `Fee schedule application failed for ${this.payload.feeScheduleId}:`,
      error.message
    )
  }
}
