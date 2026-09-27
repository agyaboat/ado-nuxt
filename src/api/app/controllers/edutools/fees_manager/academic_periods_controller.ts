import type { HttpContext } from '@adonisjs/core/http'

import AcademicPeriod from '#models/academic_period'
import FeeSchedule from '#models/fee_schedule'
import SchoolClass from '#models/school_class'

import { academicPeriodParamsValidator } from '#validators/edutools/fees_manager/academic_period'
import { serializeYear } from '#serializers/edutools/fees_manager/year'

export default class AcademicPeriodsController {
  async index({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const {
      params: { academicPeriodId },
    } = await request.validateUsing(academicPeriodParamsValidator)

    /*
    |--------------------------------------------------------------------------
    | Academic period
    |--------------------------------------------------------------------------
    */

    const academicPeriod = await AcademicPeriod.query()
      .where('id', academicPeriodId)
      .where('school_id', school.id)
      .preload('academicYear', (q) => q.preload('periods'))
      .first()

    if (!academicPeriod) {
      return response.notFound({
        message: 'Academic period not found.',
      })
    }

    /*
    |--------------------------------------------------------------------------
    | Parent classes
    |--------------------------------------------------------------------------
    |
    | Fee schedules are owned by the top-level class.
    | Child/variant classes inherit the parent's schedule.
    |
    */

    const parentClasses = await SchoolClass.query()
      .where('school_id', school.id)
      .whereNull('parent_id')
      .orderBy('sort_order', 'asc')
      .orderBy('label', 'asc')

    /*
    |--------------------------------------------------------------------------
    | No classes
    |--------------------------------------------------------------------------
    |
    | There is nothing else to build for the fee-schedule matrix.
    */

    if (parentClasses.length === 0) {
      return response.ok({
        data: {
          period: {
            id: academicPeriod.id,
            label: academicPeriod.label,
            startsAt: academicPeriod.startsAt,
            endsAt: academicPeriod.endsAt,
            sortOrder: academicPeriod.sortOrder,
          },
          year: serializeYear(academicPeriod.academicYear),

          feeSchedules: [],
        },
      })
    }

    /*
    |--------------------------------------------------------------------------
    | Fee schedules
    |--------------------------------------------------------------------------
    |
    | We only need schedules belonging to the parent classes for this
    | academic period.
    |
    */

    const classIds = parentClasses.map((schoolClass) => schoolClass.id)

    const feeSchedules = await FeeSchedule.query()
      .where('school_id', school.id)
      .where('academic_period_id', academicPeriod.id)
      .whereIn('class_id', classIds)
      .where('status', 'active')
      .select(['id', 'classId', 'accommodationType', 'amount', 'meta', 'breakdown'])

    /*
    |--------------------------------------------------------------------------
    | Index schedules by class + accommodation type
    |--------------------------------------------------------------------------
    */

    const scheduleMap = new Map<
      string,
      {
        day: FeeSchedule | null
        boarding: FeeSchedule | null
      }
    >()

    for (const schedule of feeSchedules) {
      const existing = scheduleMap.get(schedule.classId) ?? {
        day: null,
        boarding: null,
      }

      if (schedule.accommodationType === 'day') {
        existing.day = schedule
      }

      if (schedule.accommodationType === 'boarding') {
        existing.boarding = schedule
      }

      scheduleMap.set(schedule.classId, existing)
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return response.ok({
      data: {
        period: {
          id: academicPeriod.id,
          label: academicPeriod.label,
          startsAt: academicPeriod.startsAt,
          endsAt: academicPeriod.endsAt,
          sortOrder: academicPeriod.sortOrder,
        },
        year: serializeYear(academicPeriod.academicYear),

        feeSchedules: parentClasses.map((schoolClass) => {
          const schedules = scheduleMap.get(schoolClass.id) ?? {
            day: null,
            boarding: null,
          }

          return {
            class: {
              id: schoolClass.id,
              label: schoolClass.label,
            },

            day: schedules.day
              ? {
                  id: schedules.day.id,
                  amount: schedules.day.amount,
                  breakdown: schedules.day.breakdown,
                  meta: schedules.day.meta
                    ? {
                        lastAppliedAt: schedules.day.meta.lastAppliedAt ?? null,
                      }
                    : null,
                }
              : null,

            boarding: schedules.boarding
              ? {
                  id: schedules.boarding.id,
                  amount: schedules.boarding.amount,
                  meta: schedules.boarding.meta
                    ? {
                        lastAppliedAt: schedules.boarding.meta.lastAppliedAt ?? null,
                      }
                    : null,
                }
              : null,
          }
        }),
      },
    })
  }
}
