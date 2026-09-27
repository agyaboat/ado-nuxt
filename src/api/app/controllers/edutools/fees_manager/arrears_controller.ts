import type { HttpContext } from '@adonisjs/core/http'

import SchoolClass from '#models/school_class'
import AcademicPeriod from '#models/academic_period'
import StudentClassEnrollment from '#models/student_class_enrollment'
import FeeStudentLedger from '#models/fee_student_ledger'
import FeeStudentOldArrear from '#models/fee_student_old_arrear'
import FeeStudentOldArrearSettlement from '#models/fee_student_old_arrear_settlement'

import { arrearsQueryValidator } from '#validators/edutools/fees_manager/arrears'

export default class ArrearsController {
  async index({ request, response, feesManager }: HttpContext) {
    const payload = await request.validateUsing(arrearsQueryValidator)

    const school = feesManager.school

    /*
     * The school determines the current academic year through
     * its current academic period.
     */
    if (!school.currentAcademicPeriodId) {
      return response.unprocessableEntity({
        message: 'The school does not have a current academic period.',
      })
    }

    const currentPeriod = await AcademicPeriod.query()
      .where('id', school.currentAcademicPeriodId)
      .where('school_id', school.id)
      .preload('academicYear')
      .first()

    if (!currentPeriod) {
      return response.unprocessableEntity({
        message: 'The school current academic period could not be found.',
      })
    }

    const academicYearId = currentPeriod.academicYear.id

    /*
     * Resolve the requested class.
     */
    const schoolClass = await SchoolClass.query()
      .where('id', payload.classId)
      .where('school_id', school.id)
      .first()

    if (!schoolClass) {
      return response.notFound({
        message: 'Class not found.',
      })
    }

    let targetClassIds: string[] = []

    /*
     * Variant explicitly selected.
     */
    if (payload.variantId) {
      const variant = await SchoolClass.query()
        .where('id', payload.variantId)
        .where('school_id', school.id)
        .where('parent_id', schoolClass.id)
        .first()

      if (!variant) {
        return response.notFound({
          message: 'Variant not found for the selected class.',
        })
      }

      targetClassIds = [variant.id]
    } else {
      /*
       * No variant selected:
       *
       * - if the selected class has variants, return students
       *   belonging to all direct variants
       * - otherwise use the selected class itself
       */
      const childClasses = await SchoolClass.query()
        .where('school_id', school.id)
        .where('parent_id', schoolClass.id)
        .select('id')

      targetClassIds =
        childClasses.length > 0 ? childClasses.map((item) => item.id) : [schoolClass.id]
    }

    /*
     * Keep the class labels available without relying on a possibly
     * undeclared relationship on StudentClassEnrollment.
     */
    const targetClasses = await SchoolClass.query()
      .where('school_id', school.id)
      .whereIn('id', targetClassIds)
      .select(['id', 'label'])

    const classMap = new Map(
      targetClasses.map((item) => [
        item.id,
        {
          id: item.id,
          label: item.label,
        },
      ])
    )

    /*
     * The official placement for the current academic year comes
     * from StudentClassEnrollment.
     */
    const enrollments = await StudentClassEnrollment.query()
      .where('school_id', school.id)
      .where('academic_year_id', academicYearId)
      .where('status', 'active')
      .whereIn('class_id', targetClassIds)
      .preload('student')

    if (enrollments.length === 0) {
      return {
        data: [],
      }
    }

    const studentIds = enrollments.map((enrollment) => enrollment.studentId)

    /*
     * Calculate current outstanding arrears from the authoritative
     * fee student ledgers.
     */
    const ledgers = await FeeStudentLedger.query()
      .where('school_id', school.id)
      .whereIn('student_id', studentIds)
      .whereRaw('amount > amount_paid')
      .select(['studentId', 'amount', 'amountPaid'])

    const arrearsMap = new Map<string, number>()

    for (const ledger of ledgers) {
      const outstanding = Number(ledger.amount) - Number(ledger.amountPaid)

      if (outstanding <= 0) {
        continue
      }

      arrearsMap.set(ledger.studentId, (arrearsMap.get(ledger.studentId) ?? 0) + outstanding)
    }

    /*
     * Calculate outstanding previous/old arrears.
     *
     * The original arrears amount is authoritative on
     * FeeStudentOldArrear. Settlements are separate records, so
     * the remaining balance is:
     *
     *     arrear amount - total settlements
     */
    const oldArrears = await FeeStudentOldArrear.query()
      .where('school_id', school.id)
      .whereIn('student_id', studentIds)
      .select(['id', 'studentId', 'amount'])

    if (oldArrears.length > 0) {
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

        if (outstanding <= 0) {
          continue
        }

        arrearsMap.set(arrear.studentId, (arrearsMap.get(arrear.studentId) ?? 0) + outstanding)
      }
    }

    /*
     * Build the response around enrollments, because enrollment
     * determines the student's current academic placement.
     */
    const students = enrollments
      .map((enrollment) => {
        const student = enrollment.student
        const outstandingAmount = arrearsMap.get(student.id) ?? 0

        return {
          id: student.id,
          firstName: student.firstName,
          name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
          admissionNumber: student.admissionNumber ?? null,
          class: classMap.get(enrollment.classId) ?? null,
          outstandingAmount,
        }
      })
      .filter((student) => student.outstandingAmount > 0)

    /*
     * The requested ordering is intentionally applied after the
     * arrears aggregation because the amount is computed data.
     */
    students.sort((a, b) => {
      switch (payload.orderBy) {
        case 'amount_asc':
          return a.outstandingAmount - b.outstandingAmount

        case 'firstname_asc':
          return a.firstName.localeCompare(b.firstName)

        case 'firstname_desc':
          return b.firstName.localeCompare(a.firstName)

        case 'amount_desc':
        default:
          return b.outstandingAmount - a.outstandingAmount
      }
    })

    return {
      data: students.map((student) => ({
        id: student.id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        class: student.class,
        outstandingAmount: student.outstandingAmount,
      })),
    }
  }
}
