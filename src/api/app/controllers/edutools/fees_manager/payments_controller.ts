import AcademicPeriod from '#models/academic_period'
import FeeStudentLedger from '#models/fee_student_ledger'
import SchoolClass from '#models/school_class'
import SchoolStudent from '#models/school_student'
import StudentClassEnrollment from '#models/student_class_enrollment'
import { classParamsValidator } from '#validators/edutools/fees_manager/classes'
import type { HttpContext } from '@adonisjs/core/http'
import { studentParamsValidator } from '#validators/edutools/fees_manager/students'
import AcademicYear from '#models/academic_year'
import {
  getPaymentsValidator,
  paymentAllocationParamsValidator,
  recordPaymentValidator,
} from '#validators/edutools/fees_manager/payments'
import FeePaymentRecord from '#models/fee_payment_record'
import AllocatePayment from '#jobs/edutools/fees_manager/allocate_payment'
import FeePaymentAllocation from '#models/fee_payment_allocation'
import {
  serializeFeePayments,
  serializePaymentAllocation,
} from '#serializers/edutools/fees_manager/payments'
import FeeStudentOldArrear from '#models/fee_student_old_arrear'
import FeeStudentOldArrearSettlement from '#models/fee_student_old_arrear_settlement'

export default class PaymentsController {
  async getStudents({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const {
      params: { classId },
    } = await request.validateUsing(classParamsValidator)

    const schoolClass = await SchoolClass.query()
      .where('id', classId)
      .where('school_id', school.id)
      .first()

    if (!schoolClass) {
      return response.notFound({
        message: 'Class not found.',
      })
    }

    if (!school.currentAcademicPeriodId) {
      return response.conflict({
        message: 'A current academic period must be set before fetching students.',
      })
    }

    const academicPeriod = await AcademicPeriod.query()
      .where('id', school.currentAcademicPeriodId)
      .where('school_id', school.id)
      .first()

    if (!academicPeriod) {
      return response.conflict({
        message: 'The school current academic period could not be found.',
      })
    }

    const childClasses = await SchoolClass.query()
      .where('school_id', school.id)
      .where('parent_id', schoolClass.id)
      .select('id')

    const targetClassIds =
      childClasses.length > 0 ? childClasses.map((clax) => clax.id) : [schoolClass.id]

    const enrollments = await StudentClassEnrollment.query()
      .where('school_id', school.id)
      .whereIn('class_id', targetClassIds)
      .where('academic_year_id', academicPeriod.academicYearId)
      .where('status', 'active')
      .select(['student_id', 'class_id'])

    if (!enrollments.length) {
      return response.ok({
        data: [],
      })
    }

    const studentIds = enrollments.map((enrollment) => enrollment.studentId)

    const enrollmentClassMap = new Map(
      enrollments.map((enrollment) => [enrollment.studentId, enrollment.classId])
    )

    const students = await SchoolStudent.query()
      .where('school_id', school.id)
      .whereIn('id', studentIds)
      .select(['id', 'first_name', 'middle_name', 'last_name', 'admission_number'])

    const ledgers = await FeeStudentLedger.query()
      .where('school_id', school.id)
      .whereIn('student_id', studentIds)
      .select(['student_id', 'amount', 'amount_paid'])

    const arrearsMap = new Map<string, number>()

    for (const ledger of ledgers) {
      const balance = Math.max(ledger.amount - ledger.amountPaid, 0)
      arrearsMap.set(ledger.studentId, (arrearsMap.get(ledger.studentId) ?? 0) + balance)
    }

    const oldArrears = await FeeStudentOldArrear.query()
      .where('school_id', school.id)
      .whereIn('student_id', studentIds)
      .select(['id', 'student_id', 'amount'])

    if (oldArrears.length) {
      const oldArrearIds = oldArrears.map((arrear) => arrear.id)

      const settlements = await FeeStudentOldArrearSettlement.query()
        .whereIn('fee_student_old_arrear_id', oldArrearIds)
        .select(['fee_student_old_arrear_id', 'amount'])

      const settlementMap = new Map<string, number>()

      for (const settlement of settlements) {
        settlementMap.set(
          settlement.feeStudentOldArrearId,
          (settlementMap.get(settlement.feeStudentOldArrearId) ?? 0) + Number(settlement.amount)
        )
      }

      for (const arrear of oldArrears) {
        const settledAmount = settlementMap.get(arrear.id) ?? 0
        const balance = Math.max(Number(arrear.amount) - settledAmount, 0)

        if (balance <= 0) continue

        arrearsMap.set(arrear.studentId, (arrearsMap.get(arrear.studentId) ?? 0) + balance)
      }
    }

    const classIds = [...new Set(enrollments.map((enrollment) => enrollment.classId))]

    const classes = await SchoolClass.query()
      .where('school_id', school.id)
      .whereIn('id', classIds)
      .select(['id', 'label'])

    const classMap = new Map(classes.map((clax) => [clax.id, clax.label]))

    return response.ok({
      data: students.map((student) => ({
        id: student.id,
        name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
        admissionNumber: student.admissionNumber,
        class: {
          id: enrollmentClassMap.get(student.id) ?? null,
          label: classMap.get(enrollmentClassMap.get(student.id) ?? '') ?? null,
        },
        outstandingAmount: arrearsMap.get(student.id) ?? 0,
      })),
    })
  }

  async getArrears({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const {
      params: { studentId },
    } = await request.validateUsing(studentParamsValidator)

    /*
     * Current academic fee ledgers.
     */
    const ledgers = await FeeStudentLedger.query()
      .where('school_id', school.id)
      .where('student_id', studentId)
      .orderBy('academic_period_id', 'asc')
      .select(['id', 'studentId', 'academicPeriodId', 'amount', 'amountPaid'])

    /*
     * Previous/old arrears.
     *
     * There is at most one old-arrears record per student.
     * Its remaining balance is derived from:
     *
     *     amount - SUM(settlements)
     */
    const oldArrear = await FeeStudentOldArrear.query()
      .where('school_id', school.id)
      .where('student_id', studentId)
      .select(['id', 'studentId', 'amount'])
      .first()

    let old: {
      id: string
      total: number
      paid: number
    } | null = null

    let oldBalance = 0

    if (oldArrear) {
      const settlements = await FeeStudentOldArrearSettlement.query()
        .where('fee_student_old_arrear_id', oldArrear.id)
        .select(['amount'])

      const paid = settlements.reduce((total, settlement) => total + Number(settlement.amount), 0)

      const total = Number(oldArrear.amount)
      oldBalance = Math.max(total - paid, 0)

      old = {
        id: oldArrear.id,
        total,
        paid,
      }
    }

    /*
     * If there are no current academic fee ledgers, we can still
     * return previous arrears.
     */
    if (ledgers.length === 0) {
      return response.ok({
        data: {
          old,
          years: [],
          grandTotal: oldBalance,
        },
      })
    }

    const periodIds = [...new Set(ledgers.map((ledger) => ledger.academicPeriodId))]

    const periods = await AcademicPeriod.query()
      .where('school_id', school.id)
      .whereIn('id', periodIds)
      .orderBy('sort_order', 'asc')

    const yearIds = [...new Set(periods.map((period) => period.academicYearId))]

    const years = await AcademicYear.query()
      .where('school_id', school.id)
      .whereIn('id', yearIds)
      .orderBy('starts_at', 'asc')

    const periodsById = new Map(periods.map((period) => [period.id, period]))

    const yearsById = new Map(years.map((year) => [year.id, year]))

    const yearGroups = new Map<
      string,
      {
        year: AcademicYear
        periods: {
          id: string
          label: string
          total: number
          paid: number
          balance: number
        }[]
        totalDebt: number
      }
    >()

    for (const ledger of ledgers) {
      const period = periodsById.get(ledger.academicPeriodId)

      if (!period) {
        continue
      }

      const year = yearsById.get(period.academicYearId)

      if (!year) {
        continue
      }

      const total = Number(ledger.amount)
      const paid = Number(ledger.amountPaid)
      const balance = Math.max(total - paid, 0)

      if (!yearGroups.has(year.id)) {
        yearGroups.set(year.id, {
          year,
          periods: [],
          totalDebt: 0,
        })
      }

      const group = yearGroups.get(year.id)!

      group.periods.push({
        id: period.id,
        label: period.label,
        total,
        paid,
        balance,
      })

      group.totalDebt += balance
    }

    const groupedYears = Array.from(yearGroups.values())
      .sort((a, b) => a.year.startsAt!.toMillis() - b.year.startsAt!.toMillis())
      .map((group) => ({
        id: group.year.id,
        label: group.year.label,
        periods: group.periods,
        totalDebt: group.totalDebt,
      }))

    const academicDebt = groupedYears.reduce((total, year) => total + year.totalDebt, 0)

    const grandTotal = academicDebt + oldBalance

    return response.ok({
      data: {
        old,
        years: groupedYears,
        grandTotal,
      },
    })
  }

  async store({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school
    const payload = await request.validateUsing(recordPaymentValidator)

    const student = await SchoolStudent.query()
      .where('id', payload.studentId)
      .where('school_id', school.id)
      .first()

    if (!student) {
      return response.notFound({
        message: 'Student not found.',
      })
    }

    const user = auth.user!

    const payment = await FeePaymentRecord.create({
      schoolId: school.id,
      studentId: student.id,
      recordedByUserId: user.userId,
      mode: 'manual',
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      reference: payload.reference ?? null,
      paidAt: payload.paidAt,
      notes: payload.notes ?? null,
      meta: payload.meta,
    })

    try {
      await AllocatePayment.dispatch({
        paymentId: payment.id,
      })
    } catch (error) {
      console.error(`Failed to dispatch payment allocation for ${payment.id}:`, error)

      await payment.delete()

      return response.internalServerError({
        message: 'Unable to queue payment allocation.',
      })
    }

    return response.accepted({
      message: 'Payment recorded and queued for allocation.',
      data: {
        id: payment.id,
        amount: payment.amount,
        reference: payment.reference,
        paidAt: payment.paidAt,
      },
    })
  }

  async index({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const payload = await request.validateUsing(getPaymentsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = FeePaymentRecord.query().where('fee_payment_records.school_id', school.id)

    if (payload.mode) {
      query.where('fee_payment_records.mode', payload.mode)
    }

    if (payload.date) {
      query.whereRaw('DATE(fee_payment_records.paid_at) = ?', [payload.date])
    }

    if (payload.search) {
      const search = `%${payload.search}%`

      query
        .join('school_students', 'school_students.id', 'fee_payment_records.student_id')
        .where((builder) => {
          builder
            .whereRaw(
              `CONCAT_WS(' ', school_students.first_name, school_students.middle_name, school_students.last_name) ILIKE ?`,
              [search]
            )
            .orWhere('school_students.admission_number', 'ILIKE', search)
            .orWhere('fee_payment_records.reference', 'ILIKE', search)
        })

      query.select('fee_payment_records.*')
    }

    if (payload.academicPeriodId || payload.classId) {
      query.whereIn(
        'fee_payment_records.id',
        FeePaymentAllocation.query()
          .join(
            'fee_student_ledgers',
            'fee_student_ledgers.id',
            'fee_payment_allocations.fee_student_ledger_id'
          )
          .if(payload.academicPeriodId, (builder) => {
            builder.where('fee_student_ledgers.academic_period_id', payload.academicPeriodId!)
          })
          .if(payload.classId, (builder) => {
            builder.where('fee_student_ledgers.class_id', payload.classId!)
          })
          .select('fee_payment_allocations.fee_payment_record_id')
      )
    }

    const payments = await query
      .preload('student')
      .preload('paymentAllocations', (allocationQuery) => {
        allocationQuery.preload('feeStudentLedger')
      })
      .orderBy('fee_payment_records.paid_at', 'desc')
      .orderBy('fee_payment_records.created_at', 'desc')
      .paginate(page, limit)

    const data = payments.all()

    const classIds = [
      ...new Set(
        data.flatMap((payment) => {
          const ledger = payment.paymentAllocations[0]?.feeStudentLedger

          return ledger?.classId ? [ledger.classId] : []
        })
      ),
    ]

    const classes = classIds.length
      ? await SchoolClass.query().where('school_id', school.id).whereIn('id', classIds)
      : []

    const classesById = new Map(classes.map((schoolClass) => [schoolClass.id, schoolClass]))

    return response.ok({
      data: serializeFeePayments(data, classesById),
      meta: payments.getMeta(),
    })
  }

  async getAllocations({ request, response, feesManager }: HttpContext) {
    const school = feesManager.school

    const {
      params: { paymentId },
    } = await request.validateUsing(paymentAllocationParamsValidator)

    const payment = await FeePaymentRecord.query()
      .where('id', paymentId)
      .where('school_id', school.id)
      .first()

    if (!payment) {
      return response.notFound({
        message: 'Payment not found.',
      })
    }

    /*
     * Academic fee allocations.
     */
    const allocations = await FeePaymentAllocation.query()
      .where('fee_payment_record_id', payment.id)
      .preload('feeStudentLedger', (ledgerQuery) => {
        ledgerQuery.preload('academicPeriod', (periodQuery) => {
          periodQuery.preload('academicYear')
        })
      })
      .orderBy('created_at', 'asc')

    /*
     * Previous/old-arrears settlements.
     */
    const oldArrearSettlements = await FeeStudentOldArrearSettlement.query()
      .where('fee_payment_record_id', payment.id)
      .preload('oldArrear')
      .orderBy('created_at', 'asc')

    /*
     * Return both allocation types through one collection so the
     * payment allocation UI and receipt can present the complete
     * payment allocation in one place.
     */
    const data = [
      ...oldArrearSettlements.map((settlement) => ({
        id: settlement.id,
        type: 'old_arrears' as const,
        amount: Number(settlement.amount),
        academicPeriod: null,
      })),

      ...allocations.map((allocation) => ({
        ...serializePaymentAllocation(allocation),
        type: 'academic_fee' as const,
      })),
    ]

    return {
      data,
    }
  }
}
