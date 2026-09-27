import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import SchoolStudent from '#models/school_student'
import {
  createStudentValidator,
  importStudentsValidator,
  indexStudentsValidator,
  studentParamsValidator,
} from '#validators/edutools/fees_manager/students'
import AcademicPeriod from '#models/academic_period'
import StudentSerializer from '#serializers/edutools/fees_manager/students'
import SchoolClass from '#models/school_class'
import { DateTime } from 'luxon'
import StudentClassEnrollment from '#models/student_class_enrollment'
import FeePaymentRecord from '#models/fee_payment_record'
import FeeStudentLedger from '#models/fee_student_ledger'
import { studentSearchValidator } from '#validators/edutools/fees_manager/student_search'
import FeeSchedule from '#models/fee_schedule'
import FeeStudentOldArrear from '#models/fee_student_old_arrear'
import SchoolStudentUpload from '#models/school_student_upload'
import ImportStudents from '#jobs/edutools/fees_manager/import_students'
import FeeStudentOldArrearSettlement from '#models/fee_student_old_arrear_settlement'

export default class StudentsController {
  async index({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const {
      page = 1,
      limit = 20,
      search,
      classId,
      accommodation,
      status,
    } = await request.validateUsing(indexStudentsValidator)

    let academicYearId: string | null = null

    if (school.currentAcademicPeriodId) {
      const currentPeriod = await AcademicPeriod.query()
        .where('id', school.currentAcademicPeriodId)
        .where('school_id', school.id)
        .first()

      academicYearId = currentPeriod?.academicYearId ?? null
    }

    const students = await SchoolStudent.query()
      .where('school_id', school.id)
      .if(search, (query) => {
        query.where((searchQuery) => {
          searchQuery
            .whereILike('first_name', `%${search}%`)
            .orWhereILike('middle_name', `%${search}%`)
            .orWhereILike('last_name', `%${search}%`)
            .orWhereILike('admission_number', `%${search}%`)
            .orWhereILike('student_code', `%${search}%`)
        })
      })
      .if(classId && academicYearId, (query) => {
        query.whereIn(
          'current_enrollment_id',
          db
            .from('student_class_enrollments')
            .select('id')
            .where('school_id', school.id)
            .where('academic_year_id', academicYearId!)
            .where('class_id', classId!)
        )
      })
      .if(accommodation, (query) => {
        query.where('residential_status', accommodation!)
      })
      .if(status, (query) => {
        query.where('student_status', status!)
      })
      .orderBy('created_at', 'desc')
      .preload('currentEnrollment', (q) => {
        q.preload('class').preload('academicYear')
      })
      .paginate(page, limit)

    return response.ok({
      data: StudentSerializer.serializeMany(students.all()),
      meta: students.getMeta(),
    })
  }

  async store({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school
    const user = auth.use('web').user!

    const { classId, studentStatus, arrearsAmount, arrearsNote, ...payload } =
      await request.validateUsing(createStudentValidator)

    if (!school.currentAcademicPeriodId) {
      return response.conflict({
        message: 'A current academic period must be set before adding students.',
      })
    }

    const currentPeriod = await AcademicPeriod.query()
      .where('id', school.currentAcademicPeriodId)
      .where('school_id', school.id)
      .first()

    if (!currentPeriod) {
      return response.conflict({
        message: 'The school current academic period could not be found.',
      })
    }

    const academicYearId = currentPeriod.academicYearId

    const schoolClass = await SchoolClass.query()
      .where('id', classId)
      .where('school_id', school.id)
      .first()

    if (!schoolClass) {
      return response.notFound({
        message: 'Class not found.',
      })
    }

    const studentx = await db.transaction(async (trx) => {
      /*
       * ----------------------------------------------------------------------
       * 1. Create student
       * ----------------------------------------------------------------------
       */

      const student = await SchoolStudent.create(
        {
          schoolId: school.id,
          ...payload,
          addedByUserId: user.userId,
        },
        { client: trx }
      )

      /*
       * ----------------------------------------------------------------------
       * 2. Create enrollment
       * ----------------------------------------------------------------------
       */

      const enrollment = await StudentClassEnrollment.create(
        {
          schoolId: school.id,
          studentId: student.id,
          classId: schoolClass.id,
          academicYearId,
          status: 'active',
          enrolledAt: DateTime.now(),
          addedByUserId: user.userId,
        },
        { client: trx }
      )

      /*
       * currentEnrollmentId is the student's pointer to the
       * authoritative academic placement.
       */
      student.currentEnrollmentId = enrollment.id
      await student.save()

      /*
       * ----------------------------------------------------------------------
       * 3. Reload enrollment with its class and parent
       * ----------------------------------------------------------------------
       *
       * The fee schedule belongs to the parent class when the student is
       * enrolled in a variant/child class.
       */
      const enrollmentWithClass = await StudentClassEnrollment.query({
        client: trx,
      })
        .where('id', enrollment.id)
        .preload('class', (classQuery) => {
          classQuery.preload('parent')
        })
        .first()

      if (!enrollmentWithClass) {
        throw new Error('Student enrollment could not be loaded.')
      }

      const enrolledClass = enrollmentWithClass.class

      /*
       * Parent class carries the fee schedule.
       *
       * Example:
       *   Basic 2
       *      ├── Gold
       *      └── Diamond
       *
       * A Diamond enrollment therefore resolves to Basic 2 when
       * looking for its fee schedule.
       */
      const feeScheduleClassId =
        enrolledClass.parentId === null ? enrolledClass.id : (enrolledClass.parent?.id ?? null)

      /*
       * There should always be a valid effective class because variants
       * must have a parent. Still, don't attempt a schedule lookup if
       * the relationship is inconsistent.
       */
      if (!feeScheduleClassId) {
        return student
      }

      /*
       * ----------------------------------------------------------------------
       * 4. Find the applicable fee schedule
       * ----------------------------------------------------------------------
       *
       * Matching dimensions:
       *   - school
       *   - effective class (parent class or actual top-level class)
       *   - current academic period
       *   - student's residential status
       */
      const feeSchedule = await FeeSchedule.query({ client: trx })
        .where('school_id', school.id)
        .where('class_id', feeScheduleClassId)
        .where('academic_period_id', school.currentAcademicPeriodId ?? '')
        .where('accommodation_type', student.residentialStatus ?? '')
        .where('status', 'active')
        .first()

      /*
       * No applicable fee schedule means there is nothing to create yet.
       *
       * This is valid when a school has not configured a schedule for
       * this class/accommodation/period combination.
       */
      if (!feeSchedule) {
        return student
      }

      /*
       * ----------------------------------------------------------------------
       * 5. Check whether this schedule has already been applied
       * ----------------------------------------------------------------------
       *
       * lastAppliedAt means the schedule has already been applied to its
       * existing target population.
       *
       * Therefore, a student added after that application must receive
       * their ledger immediately.
       */
      const meta =
        feeSchedule.meta && typeof feeSchedule.meta === 'object'
          ? (feeSchedule.meta as {
              lastAppliedAt?: string | null
            })
          : null

      if (!meta?.lastAppliedAt) {
        /*
         * The schedule has not yet been applied.
         *
         * Leave ledger creation to the schedule's normal "Apply Fees"
         * operation, which will include this student when it runs.
         */
        return student
      }

      /*
       * ----------------------------------------------------------------------
       * 6. Prevent duplicate ledger creation
       * ----------------------------------------------------------------------
       */
      const existingLedger = await FeeStudentLedger.query({
        client: trx,
      })
        .where('student_id', student.id)
        .where('fee_schedule_id', feeSchedule.id)
        .first()

      if (existingLedger) {
        return student
      }

      /*
       * ----------------------------------------------------------------------
       * 7. Create the student's fee ledger
       * ----------------------------------------------------------------------
       */
      await FeeStudentLedger.create(
        {
          schoolId: school.id,
          studentId: student.id,
          classId: enrolledClass.id,
          accommodationType: student.residentialStatus ?? '',
          feeScheduleId: feeSchedule.id,
          academicPeriodId: feeSchedule.academicPeriodId,
          amount: feeSchedule.amount,
          amountPaid: 0,
          paymentStatus: 'unpaid',
        },
        { client: trx }
      )

      if (arrearsAmount && arrearsAmount > 0) {
        await FeeStudentOldArrear.create(
          {
            schoolId: school.id,
            studentId: student.id,
            amount: arrearsAmount * 100,
            note: arrearsNote ?? null,
            changeLogs: {
              logs: [
                {
                  action: 'created',
                  at: DateTime.now().toISO(),
                  amount: arrearsAmount,
                  user: {
                    id: user.userId,
                    name: [user.firstName, user.middleName, user.lastName]
                      .filter(Boolean)
                      .join(' '),
                  },
                },
              ],
            },
          },
          { client: trx }
        )
      }

      return student
    })

    return response.created({
      message: 'Student added successfully.',
      data: StudentSerializer.serialize(studentx),
    })
  }

  async update({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school
    const user = auth.use('web').user!

    const { classId, studentStatus, ...payload } =
      await request.validateUsing(createStudentValidator)

    const {
      params: { studentId },
    } = await request.validateUsing(studentParamsValidator)

    const student = await SchoolStudent.query()
      .where('id', studentId)
      .where('school_id', school.id)
      .first()

    if (!student) {
      return response.notFound({
        message: 'Student not found.',
      })
    }

    let academicYearId: string | null = null

    if (classId) {
      if (!school.currentAcademicPeriodId) {
        return response.conflict({
          message: 'A current academic period must be set before changing a student class.',
        })
      }

      const currentPeriod = await AcademicPeriod.query()
        .where('id', school.currentAcademicPeriodId)
        .where('school_id', school.id)
        .first()

      if (!currentPeriod) {
        return response.conflict({
          message: 'The school current academic period could not be found.',
        })
      }

      academicYearId = currentPeriod.academicYearId

      const schoolClass = await SchoolClass.query()
        .where('id', classId)
        .where('school_id', school.id)
        .first()

      if (!schoolClass) {
        return response.notFound({
          message: 'Class not found.',
        })
      }

      const enrollment = await StudentClassEnrollment.query()
        .where('school_id', school.id)
        .where('student_id', student.id)
        .where('academic_year_id', academicYearId)
        .first()

      if (enrollment) {
        enrollment.classId = schoolClass.id
        await enrollment.save()

        student.currentEnrollmentId = enrollment.id
      } else {
        const newEnrollment = await StudentClassEnrollment.create({
          schoolId: school.id,
          studentId: student.id,
          classId: schoolClass.id,
          academicYearId,
          status: 'active',
          enrolledAt: DateTime.now(),
          addedByUserId: user.userId,
        })

        student.currentEnrollmentId = newEnrollment.id
      }
    }

    student.merge(payload)
    if (studentStatus) {
      student.studentStatus = studentStatus
    }

    await student.save()
    await student.load('currentEnrollment', (q) => q.preload('academicYear').preload('class'))
    return response.ok({
      message: 'Student updated successfully.',
      data: StudentSerializer.serialize(student),
    })
  }

  async delete({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const {
      params: { studentId },
    } = await request.validateUsing(studentParamsValidator)

    const student = await SchoolStudent.query()
      .where('id', studentId)
      .where('school_id', school.id)
      .first()

    if (!student) {
      return response.notFound({
        message: 'Student not found.',
      })
    }

    const ledgerIds = await FeeStudentLedger.query().where('student_id', student.id).select('id')

    const payment = await FeePaymentRecord.query()
      .whereIn(
        'fee_student_ledger_id',
        ledgerIds.map((ledger) => ledger.id)
      )
      .first()

    if (payment) {
      return response.conflict({
        message: 'This student cannot be deleted because they have fee payment records.',
      })
    }

    await student.delete()

    return response.ok({
      message: 'Student deleted successfully.',
    })
  }

  async searchStudents({ request, feesManager }: HttpContext) {
    const school = feesManager.school

    const { q } = await request.validateUsing(studentSearchValidator)

    const search = q.trim()

    if (!search) {
      return {
        data: [],
      }
    }

    const students = await SchoolStudent.query()
      .where('school_id', school.id)
      .where('student_status', 'active')
      .where((query) => {
        query
          .where('first_name', 'ilike', `%${search}%`)
          .orWhere('middle_name', 'ilike', `%${search}%`)
          .orWhere('last_name', 'ilike', `%${search}%`)
          .orWhere('admission_number', 'ilike', `%${search}%`)
      })
      .preload('currentEnrollment', (enrollmentQuery) => {
        enrollmentQuery.preload('class')
      })
      .orderBy('first_name', 'asc')
      .orderBy('last_name', 'asc')
      .limit(20)

    if (!students.length) {
      return {
        data: [],
      }
    }

    const studentIds = students.map((student) => student.id)

    const ledgers = await FeeStudentLedger.query()
      .where('school_id', school.id)
      .whereIn('student_id', studentIds)
      .whereRaw('amount > amount_paid')
      .select(['studentId', 'amount', 'amountPaid'])

    const outstandingByStudent = new Map<string, number>()

    for (const ledger of ledgers) {
      const outstanding = Number(ledger.amount) - Number(ledger.amountPaid)

      outstandingByStudent.set(
        ledger.studentId,
        (outstandingByStudent.get(ledger.studentId) ?? 0) + outstanding
      )
    }

    const oldArrears = await FeeStudentOldArrear.query()
      .where('school_id', school.id)
      .whereIn('student_id', studentIds)
      .select(['id', 'studentId', 'amount'])

    if (oldArrears.length) {
      const oldArrearIds = oldArrears.map((arrear) => arrear.id)

      const settlements = await FeeStudentOldArrearSettlement.query()
        .whereIn('fee_student_old_arrear_id', oldArrearIds)
        .select(['feeStudentOldArrearId', 'amount'])

      const settlementMap = new Map<string, number>()

      for (const settlement of settlements) {
        settlementMap.set(
          settlement.feeStudentOldArrearId,
          (settlementMap.get(settlement.feeStudentOldArrearId) ?? 0) + Number(settlement.amount)
        )
      }

      for (const arrear of oldArrears) {
        const settledAmount = settlementMap.get(arrear.id) ?? 0
        const outstanding = Number(arrear.amount) - settledAmount

        if (outstanding <= 0) continue

        outstandingByStudent.set(
          arrear.studentId,
          (outstandingByStudent.get(arrear.studentId) ?? 0) + outstanding
        )
      }
    }

    return {
      data: students.map((student) => ({
        id: student.id,
        name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
        admissionNumber: student.admissionNumber,
        class: student.currentEnrollment?.class
          ? {
              id: student.currentEnrollment.class.id,
              label: student.currentEnrollment.class.label,
            }
          : null,
        outstandingAmount: outstandingByStudent.get(student.id) ?? 0,
      })),
    }
  }

  async upload({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school
    const user = auth.user!

    const { classId, students } = await request.validateUsing(importStudentsValidator)

    const schoolClass = await SchoolClass.query()
      .where('id', classId)
      .where('school_id', school.id)
      .first()

    if (!schoolClass) {
      return response.notFound({ message: 'Selected class was not found.' })
    }

    if (schoolClass.parentId) {
      const parentClass = await SchoolClass.query()
        .where('id', schoolClass.parentId)
        .where('school_id', school.id)
        .first()

      if (!parentClass) {
        return response.badRequest({ message: 'Invalid class selection.' })
      }
    }

    const studentCount = await SchoolStudent.query()
      .where('school_id', school.id)
      .whereHas('currentEnrollment', (query) => {
        query.where('class_id', classId)
      })
      .count('* as total')

    if (Number(studentCount[0].$extras.total) + students.length > 100) {
      return response.badRequest({
        message: 'The selected class cannot contain more than 100 students.',
      })
    }

    const admissionNumbers = students.map((student) => student.admissionNumber.trim())
    const duplicateAdmissionNumbers = admissionNumbers.filter(
      (value, index) => admissionNumbers.indexOf(value) !== index
    )

    if (duplicateAdmissionNumbers.length > 0) {
      return response.badRequest({
        message: `Duplicate admission number: ${duplicateAdmissionNumbers[0]}`,
      })
    }

    const existingStudent = await SchoolStudent.query()
      .where('school_id', school.id)
      .whereIn('admission_number', admissionNumbers)
      .select(['admissionNumber'])
      .first()

    if (existingStudent) {
      return response.badRequest({
        message: `Admission number already exists: ${existingStudent.admissionNumber}`,
      })
    }

    const upload = await SchoolStudentUpload.create({
      schoolId: school.id,
      classId,
      userId: user.userId,
      totalStudents: students.length,
      status: 'running',
    })

    await ImportStudents.dispatch({
      schoolId: school.id,
      classId,
      uploadId: upload.id,
      students,
      user: {
        id: user.userId,
        fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
        email: user.email,
      },
    })

    return response.accepted({
      data: { uploadId: upload.id },
      message: 'Student upload has been queued.',
    })
  }

  async getUploads({ feesManager, response }: HttpContext) {
    const school = feesManager.school

    const uploads = await SchoolStudentUpload.query()
      .where('school_id', school.id)
      .preload('schoolClass')
      .orderBy('created_at', 'desc')

    return response.ok({
      data: uploads.map((upload) => ({
        id: upload.id,
        class: {
          id: upload.schoolClass.id,
          label: upload.schoolClass.label,
        },
        totalStudents: upload.totalStudents,
        status: upload.status,
        errorMessage: upload.errorMessage,
        createdAt: upload.createdAt,
        completedAt: upload.completedAt,
        failedAt: upload.failedAt,
        revertibleUntil: upload.revertibleUntil,
      })),
    })
  }
}
