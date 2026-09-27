import type { HttpContext } from '@adonisjs/core/http'

import AcademicYear from '#models/academic_year'
import {
  academicYearParamsValidator,
  createAcademicPeriodValidator,
  createAcademicYearValidator,
  deleteAcademicPeriodValidator,
  setCurrentPeriodValidator,
  updateAcademicPeriodValidator,
  updateAcademicYearValidator,
} from '#validators/edutools/fees_manager/academic_years'
import AcademicPeriod from '#models/academic_period'
import FeeStudentLedger from '#models/fee_student_ledger'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class AcademicYearsController {
  async index({ feesManager, response }: HttpContext) {
    const school = feesManager.school

    const academicYears = await AcademicYear.query()
      .where('school_id', school.id)
      .preload('periods', (query) => {
        query.orderBy('sort_order', 'asc').orderBy('starts_at', 'asc')
      })
      .orderBy('starts_at', 'desc')

    const serializeYear = (year: AcademicYear) => ({
      id: year.id,
      label: year.label,
      startsAt: year.startsAt,
      endsAt: year.endsAt,
      periodScheme: year.periodScheme,
      periods: year.periods.map((period) => ({
        id: period.id,
        label: period.label,
        startsAt: period.startsAt,
        endsAt: period.endsAt,
        sortOrder: period.sortOrder,
      })),
    })

    /*
     * First preference:
     * derive the current academic year from the school's
     * current academic period.
     */
    let currentYear = school.currentAcademicPeriodId
      ? (academicYears.find((year) =>
          year.periods.some((period) => period.id === school.currentAcademicPeriodId)
        ) ?? null)
      : null

    /*
     * Fresh subscription fallback:
     *
     * If there is only one academic year and today falls within
     * that year's date range, deliberately treat it as current
     * even if no academic period has been set as current yet.
     */
    if (!currentYear && academicYears.length === 1) {
      const onlyYear = academicYears[0]
      const now = DateTime.now()

      const startsAt = onlyYear.startsAt!.toMillis()
      const endsAt = onlyYear.endsAt!.toMillis()
      const currentTime = now.toMillis()

      const isWithinYear = currentTime >= startsAt && currentTime <= endsAt

      if (isWithinYear) {
        currentYear = onlyYear
      }
    }

    const pastYears = academicYears.filter((year) => year.id !== currentYear?.id)

    return response.ok({
      data: {
        current: currentYear ? serializeYear(currentYear) : null,

        past: pastYears.map(serializeYear),

        currentPeriod: school.currentAcademicPeriodId,
      },
    })
  }
  async store({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school
    const user = auth.use('web').user

    if (!user) {
      return response.unauthorized({
        message: 'Unauthorized',
      })
    }

    const payload = await request.validateUsing(createAcademicYearValidator)

    const [startYear, endYear] = payload.label.split('/').map(Number)

    const startsAt = payload.startsAt
    const endsAt = payload.endsAt

    if (endYear !== (startYear ?? 0) + 1) {
      return response.badRequest({
        message: 'Academic year must contain two consecutive years.',
      })
    }

    if (startsAt.year !== (startYear ?? 0)) {
      return response.badRequest({
        message: 'Academic year start date must fall within the first year.',
      })
    }

    if (endsAt.year !== (endYear ?? 0)) {
      return response.badRequest({
        message: 'Academic year end date must fall within the second year.',
      })
    }

    if (endsAt <= startsAt) {
      return response.badRequest({
        message: 'Academic year end date must be after the start date.',
      })
    }

    const existingYear = await AcademicYear.query()
      .where('school_id', school.id)
      .whereRaw('LOWER(label) = ?', [payload.label.toLowerCase()])
      .first()

    if (existingYear) {
      return response.conflict({
        message: 'This academic year already exists.',
      })
    }

    const overlappingYear = await AcademicYear.query()
      .where('school_id', school.id)
      .where('starts_at', '<', endsAt.toJSDate())
      .where('ends_at', '>', startsAt.toJSDate())
      .first()

    if (overlappingYear) {
      return response.conflict({
        message: 'This academic year overlaps an existing academic year.',
      })
    }

    const academicYear = new AcademicYear()

    academicYear.merge({
      schoolId: school.id,
      label: payload.label,
      periodScheme: payload.periodScheme,
      startsAt,
      endsAt,
      createdByUserId: user.userId,
    })

    await academicYear.save()

    return response.created({
      message: 'Academic year created successfully.',
      data: {
        id: academicYear.id,
        label: academicYear.label,
        startsAt: academicYear.startsAt,
        endsAt: academicYear.endsAt,
      },
    })
  }

  async storePeriod({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school
    const user = auth.use('web').user

    if (!user) {
      return response.unauthorized({
        message: 'Unauthorized',
      })
    }

    const { params, ...payload } = await request.validateUsing(createAcademicPeriodValidator)

    const { academicYearId } = params

    const academicYear = await AcademicYear.query()
      .where('id', academicYearId)
      .where('school_id', school.id)
      .first()

    if (!academicYear) {
      return response.notFound({
        message: 'Academic year not found.',
      })
    }

    const periodLimit = academicYear.periodScheme === 'semester' ? 2 : 3

    const periodCount = await AcademicPeriod.query()
      .where('academic_year_id', academicYear.id)
      .count('* as total')

    if (Number(periodCount[0].$extras.total) >= periodLimit) {
      return response.conflict({
        message: `This academic year already has the maximum ` + `${periodLimit} academic periods.`,
      })
    }

    const normalizedLabel = payload.label.trim().toLowerCase()

    const existingPeriod = await AcademicPeriod.query()
      .where('academic_year_id', academicYear.id)
      .whereRaw('LOWER(TRIM(label)) = ?', [normalizedLabel])
      .first()

    if (existingPeriod) {
      return response.conflict({
        message: 'A period with this name already exists.',
      })
    }

    if (payload.startsAt < academicYear.startsAt! || payload.startsAt > academicYear.endsAt!) {
      return response.badRequest({
        message: 'Period start date must fall within the academic year.',
      })
    }

    if (payload.endsAt < academicYear.startsAt! || payload.endsAt > academicYear.endsAt!) {
      return response.badRequest({
        message: 'Period end date must fall within the academic year.',
      })
    }

    if (payload.endsAt <= payload.startsAt) {
      return response.badRequest({
        message: 'Period end date must be after the start date.',
      })
    }

    const overlappingPeriod = await AcademicPeriod.query()
      .where('academic_year_id', academicYear.id)
      .where('starts_at', '<', payload.endsAt.toJSDate())
      .where('ends_at', '>', payload.startsAt.toJSDate())
      .first()

    if (overlappingPeriod) {
      return response.conflict({
        message: 'This academic period overlaps an existing period.',
      })
    }

    const academicPeriodx = await db.transaction(async (trx) => {
      const academicPeriod = new AcademicPeriod()

      academicPeriod.useTransaction(trx)

      academicPeriod.merge({
        schoolId: school.id,
        academicYearId: academicYear.id,
        label: payload.label.trim(),
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        sortOrder: payload.sortOrder,
        createdByUserId: user.userId,
      })

      await academicPeriod.save()

      /*
       * The newly created academic period becomes the
       * school's current academic period immediately.
       */
      school.useTransaction(trx)

      school.currentAcademicPeriodId = academicPeriod.id

      await school.save()

      return academicPeriod
    })

    return response.created({
      message: 'Academic period started successfully.',
      data: {
        id: academicPeriodx.id,
        label: academicPeriodx.label,
        startsAt: academicPeriodx.startsAt,
        endsAt: academicPeriodx.endsAt,
        sortOrder: academicPeriodx.sortOrder,
      },
    })
  }

  async setCurrentPeriod({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const { periodId } = await request.validateUsing(setCurrentPeriodValidator)

    const academicPeriod = await AcademicPeriod.query()
      .where('id', periodId)
      .where('school_id', school.id)
      .first()

    if (!academicPeriod) {
      return response.notFound({
        message: 'Academic period not found.',
      })
    }

    const now = DateTime.now()

    const startsAt = academicPeriod.startsAt.toMillis()
    const endsAt = academicPeriod.endsAt.toMillis()
    const currentTime = now.toMillis()

    if (currentTime < startsAt || currentTime > endsAt) {
      return response.conflict({
        message:
          'An academic period can only be set as current while today falls within its start and end dates.',
      })
    }

    school.currentAcademicPeriodId = academicPeriod.id

    await school.save()

    return response.ok({
      message: 'Academic period set as current.',
      data: {
        id: academicPeriod.id,
      },
    })
  }

  async deletePeriod({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const { params } = await request.validateUsing(deleteAcademicPeriodValidator)

    const academicPeriod = await AcademicPeriod.query()
      .where('id', params.academicPeriodId)
      .where('school_id', school.id)
      .first()

    if (!academicPeriod) {
      return response.notFound({
        message: 'Academic period not found.',
      })
    }

    if (school.currentAcademicPeriodId === academicPeriod.id) {
      return response.conflict({
        message:
          'This academic period is currently active. Set another period as current, then you can delete this period.',
      })
    }

    const hasFeeRecords = await FeeStudentLedger.query()
      .where('academic_period_id', academicPeriod.id)
      .first()

    if (hasFeeRecords) {
      return response.conflict({
        message:
          'This academic period cannot be deleted because it has financial records linked to it.',
      })
    }

    await academicPeriod.delete()

    return response.ok({
      message: 'Academic period deleted successfully.',
    })
  }

  async update({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const payload = await request.validateUsing(updateAcademicYearValidator)

    const { params } = await request.validateUsing(academicYearParamsValidator)

    const { academicYearId } = params

    const academicYear = await AcademicYear.query()
      .where('id', academicYearId)
      .where('school_id', school.id)
      .first()

    if (!academicYear) {
      return response.notFound({
        message: 'Academic year not found.',
      })
    }

    /*
    |--------------------------------------------------------------------------
    | Academic year identity
    |--------------------------------------------------------------------------
    |
    | The label is immutable, so derive the expected years from the
    | existing academic year rather than from request data.
    |
    */

    const [startYear, endYear] = academicYear.label.split('/').map(Number)

    if (!startYear || !endYear || endYear !== startYear + 1) {
      return response.unprocessableEntity({
        message: 'The academic year has an invalid year range.',
      })
    }

    /*
    |--------------------------------------------------------------------------
    | Date boundaries
    |--------------------------------------------------------------------------
    */

    if (payload.startsAt.year !== startYear) {
      return response.badRequest({
        message: 'Academic year start date must fall within the first year.',
      })
    }

    if (payload.endsAt.year !== endYear) {
      return response.badRequest({
        message: 'Academic year end date must fall within the second year.',
      })
    }

    if (payload.endsAt <= payload.startsAt) {
      return response.badRequest({
        message: 'Academic year end date must be after the start date.',
      })
    }

    /*
    |--------------------------------------------------------------------------
    | Existing academic periods
    |--------------------------------------------------------------------------
    |
    | The academic year cannot be shortened beyond periods that already
    | exist inside it.
    |
    */

    const periods = await AcademicPeriod.query()
      .where('academic_year_id', academicYear.id)
      .orderBy('sort_order', 'asc')

    const startsBeforeChild = periods.some((period) => {
      return payload.startsAt > period.startsAt
    })

    if (startsBeforeChild) {
      return response.conflict({
        message:
          'The academic year start date cannot be after the start date of an existing academic period.',
      })
    }

    const endsBeforeChild = periods.some((period) => {
      return payload.endsAt < period.endsAt
    })

    if (endsBeforeChild) {
      return response.conflict({
        message:
          'The academic year end date cannot be before the end date of an existing academic period.',
      })
    }

    /*
    |--------------------------------------------------------------------------
    | Academic year overlap
    |--------------------------------------------------------------------------
    */

    const overlappingYear = await AcademicYear.query()
      .where('school_id', school.id)
      .where('id', '!=', academicYear.id)
      .where('starts_at', '<', payload.endsAt.toJSDate())
      .where('ends_at', '>', payload.startsAt.toJSDate())
      .first()

    if (overlappingYear) {
      return response.conflict({
        message: 'This academic year overlaps an existing academic year.',
      })
    }

    /*
    |--------------------------------------------------------------------------
    | Update dates only
    |--------------------------------------------------------------------------
    */

    academicYear.merge({
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
    })

    await academicYear.save()

    return response.ok({
      message: 'Academic year dates updated successfully.',
      data: {
        id: academicYear.id,
        label: academicYear.label,
        startsAt: academicYear.startsAt,
        endsAt: academicYear.endsAt,
        periodScheme: academicYear.periodScheme,
      },
    })
  }

  async deleteYear({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const { params } = await request.validateUsing(academicYearParamsValidator)

    const academicYear = await AcademicYear.query()
      .where('id', params.academicYearId)
      .where('school_id', school.id)
      .first()

    if (!academicYear) {
      return response.notFound({
        message: 'Academic year not found.',
      })
    }

    const period = await AcademicPeriod.query().where('academic_year_id', academicYear.id).first()

    if (period) {
      return response.conflict({
        message:
          'This academic year cannot be deleted because it has academic periods. Delete its periods first.',
      })
    }

    await academicYear.delete()

    return response.ok({
      message: 'Academic year deleted successfully.',
    })
  }

  async updatePeriod({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const { params, ...payload } = await request.validateUsing(updateAcademicPeriodValidator)

    const { academicPeriodId } = params

    const academicPeriod = await AcademicPeriod.query()
      .where('id', academicPeriodId)
      .where('school_id', school.id)
      .preload('academicYear')
      .first()

    if (!academicPeriod) {
      return response.notFound({
        message: 'Academic period not found.',
      })
    }

    const academicYear = academicPeriod.academicYear

    if (!academicYear) {
      return response.notFound({
        message: 'Academic year not found.',
      })
    }

    const normalizedLabel = payload.label.trim().toLowerCase()

    const existingPeriod = await AcademicPeriod.query()
      .where('academic_year_id', academicYear.id)
      .where('id', '!=', academicPeriod.id)
      .whereRaw('LOWER(TRIM(label)) = ?', [normalizedLabel])
      .first()

    if (existingPeriod) {
      return response.conflict({
        message: 'A period with this name already exists.',
      })
    }

    if (payload.startsAt < academicYear.startsAt! || payload.startsAt > academicYear.endsAt!) {
      return response.badRequest({
        message: 'Period start date must fall within the academic year.',
      })
    }

    if (payload.endsAt < academicYear.startsAt! || payload.endsAt > academicYear.endsAt!) {
      return response.badRequest({
        message: 'Period end date must fall within the academic year.',
      })
    }

    if (payload.endsAt <= payload.startsAt) {
      return response.badRequest({
        message: 'Period end date must be after the start date.',
      })
    }

    const overlappingPeriod = await AcademicPeriod.query()
      .where('academic_year_id', academicYear.id)
      .where('id', '!=', academicPeriod.id)
      .where('starts_at', '<', payload.endsAt.toJSDate())
      .where('ends_at', '>', payload.startsAt.toJSDate())
      .first()

    if (overlappingPeriod) {
      return response.conflict({
        message: 'This academic period overlaps another academic period.',
      })
    }

    academicPeriod.merge({
      label: payload.label.trim(),
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
    })

    await academicPeriod.save()

    return response.ok({
      message: 'Academic period updated successfully.',
      data: {
        id: academicPeriod.id,
        label: academicPeriod.label,
        sortOrder: academicPeriod.sortOrder,
        startsAt: academicPeriod.startsAt,
        endsAt: academicPeriod.endsAt,
      },
    })
  }
}
