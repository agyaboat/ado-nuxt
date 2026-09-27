import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

import School from '#models/school'
import SchoolClass from '#models/school_class'
import SchoolStudent from '#models/school_student'
import SchoolStudentUpload from '#models/school_student_upload'
import StudentClassEnrollment from '#models/student_class_enrollment'

import AcademicPeriod from '#models/academic_period'
import FeeSchedule from '#models/fee_schedule'
import FeeStudentLedger from '#models/fee_student_ledger'
import FeeStudentOldArrear from '#models/fee_student_old_arrear'

interface ImportStudent {
  firstName: string
  middleName?: string | null
  lastName: string
  admissionNumber: string
  gender?: string | null
  residentialStatus: string
  arrearsAmount?: number
  arrearsNote?: string | null
}

interface ImportStudentsPayload {
  schoolId: string
  classId: string
  uploadId: string
  students: ImportStudent[]
  user: {
    id: string
    fullName: string
    email: string
  }
}

export default class ImportStudents extends Job<ImportStudentsPayload> {
  static options: JobOptions = {
    queue: 'default',
    maxRetries: 3,
  }

  async execute() {
    const { schoolId, classId, uploadId, students, user } = this.payload

    const upload = await SchoolStudentUpload.query()
      .where('id', uploadId)
      .where('school_id', schoolId)
      .first()

    if (!upload) {
      console.error(`Student upload ${uploadId} was not found.`)
      return
    }

    const trx = await db.transaction()

    try {
      const school = await School.query({ client: trx }).where('id', schoolId).first()

      if (!school) {
        throw new Error('School not found.')
      }

      const schoolClass = await SchoolClass.query({ client: trx })
        .where('id', classId)
        .where('school_id', schoolId)
        .first()

      if (!schoolClass) {
        throw new Error('Selected class was not found.')
      }

      if (schoolClass.parentId) {
        const parentClass = await SchoolClass.query({ client: trx })
          .where('id', schoolClass.parentId)
          .where('school_id', schoolId)
          .first()

        if (!parentClass) {
          throw new Error('Parent class was not found.')
        }
      }

      if (students.length > 100) {
        throw new Error('A maximum of 100 students can be imported at once.')
      }

      const academicPeriodId = school.currentAcademicPeriodId

      if (!academicPeriodId) {
        throw new Error('There is no current academic period.')
      }

      const academicPeriod = await AcademicPeriod.query({ client: trx })
        .where('id', academicPeriodId)
        .where('school_id', schoolId)
        .preload('academicYear')
        .first()

      if (!academicPeriod) {
        throw new Error('Current academic period was not found.')
      }

      const studentCount = await SchoolStudent.query({ client: trx })
        .where('school_id', schoolId)
        .whereNotNull('current_enrollment_id')
        .whereHas('currentEnrollment', (query) => {
          query.where('class_id', classId)
        })
        .count('* as total')

      if (Number(studentCount[0].$extras.total) + students.length > 100) {
        throw new Error('The selected class cannot contain more than 100 students.')
      }

      const admissionNumbers = students.map((student) => student.admissionNumber.trim())

      const duplicateAdmissionNumbers = admissionNumbers.filter(
        (value, index) => admissionNumbers.indexOf(value) !== index
      )

      if (duplicateAdmissionNumbers.length > 0) {
        throw new Error(`Duplicate admission number: ${duplicateAdmissionNumbers[0]}`)
      }

      const existingStudents = await SchoolStudent.query({ client: trx })
        .where('school_id', schoolId)
        .whereIn('admission_number', admissionNumbers)
        .select(['admissionNumber'])

      if (existingStudents.length > 0) {
        throw new Error(`Admission number already exists: ${existingStudents[0].admissionNumber}`)
      }

      const feeSchedules = await FeeSchedule.query({ client: trx })
        .where('school_id', schoolId)
        .where('academic_period_id', academicPeriod.id)
        .where('status', 'active')
        .whereIn('class_id', [classId, ...(schoolClass.parentId ? [schoolClass.parentId] : [])])

      for (const studentData of students) {
        const student = await SchoolStudent.create(
          {
            schoolId,
            firstName: studentData.firstName,
            middleName: studentData.middleName,
            lastName: studentData.lastName,
            admissionNumber: studentData.admissionNumber,
            gender: studentData.gender,
            residentialStatus: studentData.residentialStatus,
            uploadId,
          },
          { client: trx }
        )

        const enrollment = await StudentClassEnrollment.create(
          {
            schoolId,
            studentId: student.id,
            classId,
            academicYearId: academicPeriod.academicYear.id,
            status: 'active',
            enrolledAt: DateTime.now(),
          },
          { client: trx }
        )

        student.currentEnrollmentId = enrollment.id
        student.useTransaction(trx)
        await student.save()

        if (studentData.arrearsAmount && studentData.arrearsAmount > 0) {
          await FeeStudentOldArrear.create(
            {
              schoolId,
              studentId: student.id,
              amount: Math.round(studentData.arrearsAmount * 100),
              note: studentData.arrearsNote,
              changeLogs: {
                logs: [
                  {
                    action: 'created',
                    at: DateTime.now().toISO(),
                    amount: Math.round(studentData.arrearsAmount * 100),
                    user: {
                      id: user.id,
                      name: user.fullName,
                    },
                  },
                ],
              },
            },
            { client: trx }
          )
        }

        const studentFeeSchedules = feeSchedules.filter((schedule) => {
          if (schedule.classId === classId) return true
          return schedule.classId === schoolClass.parentId
        })

        for (const feeSchedule of studentFeeSchedules) {
          if (feeSchedule.accommodationType !== studentData.residentialStatus) continue

          const amount = Number(feeSchedule.amount)

          await FeeStudentLedger.create(
            {
              schoolId,
              studentId: student.id,
              accommodationType: student.residentialStatus as any,
              feeScheduleId: feeSchedule.id,
              academicPeriodId: academicPeriod.id,
              classId,
              amount,
              amountPaid: 0,
              paymentStatus: amount > 0 ? 'unpaid' : 'paid',
              breakdown: feeSchedule.breakdown,
            },
            { client: trx }
          )
        }
      }

      await trx.commit()

      upload.status = 'success'
      upload.completedAt = DateTime.now()
      upload.revertibleUntil = DateTime.now().plus({ hours: 24 })
      upload.errorMessage = null
      upload.failedAt = null
      await upload.save()
    } catch (error) {
      await trx.rollback()

      const message = error instanceof Error ? error.message : 'Student upload failed.'

      console.error(`Student upload ${uploadId} failed:`, error)

      upload.status = 'failed'
      upload.failedAt = DateTime.now()
      upload.errorMessage = message
      await upload.save()
    }
  }
}
