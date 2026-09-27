import type { HttpContext } from '@adonisjs/core/http'

import FeeStudentLedger from '#models/fee_student_ledger'
import { dashboardValidator } from '#validators/edutools/fees_manager/dashboard'

export default class DashboardController {
  async index({ feesManager, request, response }: HttpContext) {
    const { school } = feesManager

    const {
      params: { academicPeriodId },
    } = await request.validateUsing(dashboardValidator)

    const period = await school
      .related('academicPeriods')
      .query()
      .preload('academicYear')
      .where('id', academicPeriodId)
      .first()

    if (!period) {
      return response.notFound({
        message: 'Academic period not found.',
      })
    }

    const financial = await FeeStudentLedger.query()
      .where('school_id', school.id)
      .where('academic_period_id', period.id)
      .sum('amount as expected')
      .sum('amount_paid as collected')
      .first()

    const students = await FeeStudentLedger.query()
      .where('school_id', school.id)
      .where('academic_period_id', period.id)
      .select('payment_status')
      .count('* as total')
      .groupBy('payment_status')

    const expected = Number(financial?.$extras.expected ?? 0) / 100
    const collected = Number(financial?.$extras.collected ?? 0) / 100
    const outstanding = expected - collected

    const paidInFull = Number(
      students.find((row) => row.paymentStatus === 'paid')?.$extras.total ?? 0
    )

    const partiallyPaid = Number(
      students.find((row) => row.paymentStatus === 'partial')?.$extras.total ?? 0
    )

    const outstandingStudents = Number(
      students.find((row) => row.paymentStatus === 'unpaid')?.$extras.total ?? 0
    )

    return response.ok({
      data: {
        academicYearLabel: period.academicYear.label,
        period: {
          id: period.id,
          label: period.label,
          startsAt: period.startsAt,
          endsAt: period.endsAt,
          academicYearId: period.academicYearId,
        },

        financial: {
          expected,
          collected,
          outstanding,
          collectionRate: expected > 0 ? Number(((collected / expected) * 100).toFixed(1)) : 0,
        },

        students: {
          paidInFull,
          partiallyPaid,
          outstanding: outstandingStudents,
        },
      },
    })
  }
}
