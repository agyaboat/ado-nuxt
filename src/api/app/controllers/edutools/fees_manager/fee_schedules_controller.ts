import type { HttpContext } from '@adonisjs/core/http'

import AcademicPeriod from '#models/academic_period'
import FeeSchedule from '#models/fee_schedule'
import SchoolClass from '#models/school_class'

import {
  createFeeScheduleValidator,
  feeScheduleParamsValidator,
  indexFeeSchedulesValidator,
  updateFeeScheduleValidator,
} from '#validators/edutools/fees_manager/fee_schedule'
import FeeScheduleSerializer from '#serializers/edutools/fees_manager/fee_schedule_serializer'
import ApplyFeeSchedule from '#jobs/apply_fee_schedule'
// import db from '@adonisjs/lucid/services/db'
import lockManager from '@adonisjs/lock/services/main'
// import FeePaymentRecord from '#models/fee_payment_record'
import db from '@adonisjs/lucid/services/db'
import FeeStudentLedger from '#models/fee_student_ledger'
import { academicPeriodParamsValidator } from '#validators/edutools/fees_manager/academic_period'

export default class FeeSchedules {
  async index({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const {
      page = 1,
      limit = 10,
      search,
      academicPeriodId,
      classId,
      accommodation,
    } = await request.validateUsing(indexFeeSchedulesValidator)

    const feeSchedules = await FeeSchedule.query()
      .where('school_id', school.id)
      .if(search, (query) => {
        query.where((searchQuery) => {
          searchQuery
            .whereHas('class', (classQuery) => {
              classQuery.whereILike('label', `%${search}%`)
            })
            .orWhereHas('academicPeriod', (periodQuery) => {
              periodQuery
                .whereILike('label', `%${search}%`)
                .orWhereHas('academicYear', (yearQuery) => {
                  yearQuery.whereILike('label', `%${search}%`)
                })
            })
            .orWhereILike('accommodation_type', `%${search}%`)
        })
      })
      .if(academicPeriodId, (query) => {
        query.where('academic_period_id', academicPeriodId!)
      })
      .if(classId, (query) => {
        query.where('class_id', classId!)
      })
      .if(accommodation, (query) => {
        query.where('accommodation_type', accommodation!)
      })
      .preload('class')
      .preload('academicPeriod', (query) => {
        query.preload('academicYear')
      })
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.ok({
      data: FeeScheduleSerializer.serializeMany(feeSchedules.all()),
      meta: feeSchedules.getMeta(),
    })
  }

  async store({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school

    const payload = await request.validateUsing(createFeeScheduleValidator)

    const academicPeriod = await AcademicPeriod.query()
      .where('id', payload.academicPeriodId)
      .where('school_id', school.id)
      .first()

    if (!academicPeriod) {
      return response.notFound({
        message: 'Academic period not found.',
      })
    }

    const schoolClass = await SchoolClass.query()
      .where('id', payload.classId)
      .where('school_id', school.id)
      .first()

    if (!schoolClass) {
      return response.notFound({
        message: 'Class not found.',
      })
    }

    if (payload.breakdown) {
      const breakdownTotal = Object.values(payload.breakdown).reduce(
        (total, amount) => total + amount,
        0
      )

      if (breakdownTotal !== payload.amount) {
        return response.unprocessableEntity({
          message: 'Fee breakdown total must equal the total fee amount.',
        })
      }
    }

    const existingFeeSchedule = await FeeSchedule.query()
      .where('school_id', school.id)
      .where('academic_period_id', academicPeriod.id)
      .where('class_id', schoolClass.id)
      .where('accommodation_type', payload.accommodationType)
      .first()

    if (existingFeeSchedule) {
      return response.conflict({
        message:
          'A fee schedule already exists for this class, academic period, and accommodation type.',
      })
    }

    const feeSchedule = await FeeSchedule.create({
      schoolId: school.id,
      classId: schoolClass.id,
      academicPeriodId: academicPeriod.id,
      accommodationType: payload.accommodationType,
      amount: payload.amount,
      breakdown: payload.breakdown ?? null,
      status: 'active',
    })

    const user = auth.use('web').user!

    const applicationUser = {
      id: user.userId,
      fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
      email: user.email,
    }

    try {
      const queued = await this.queueFeeScheduleApplication(feeSchedule.id, applicationUser)

      if (!queued) {
        return response.conflict({
          message: 'Fee schedule was created, but its application is already running.',
        })
      }
    } catch (error) {
      console.error(`Unable to queue fee schedule application for ${feeSchedule.id}:`, error)

      return response.internalServerError({
        message: 'Fee schedule was created, but its application could not be queued.',
      })
    }

    await feeSchedule.load('class')

    await feeSchedule.load('academicPeriod', (query) => {
      query.preload('academicYear')
    })

    return response.created({
      message: 'Fee schedule added successfully and application has been queued.',
      data: FeeScheduleSerializer.serialize(feeSchedule),
    })
  }

  async update({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school

    const {
      params: { feeId },
    } = await request.validateUsing(feeScheduleParamsValidator)

    const payload = await request.validateUsing(updateFeeScheduleValidator)

    const feeSchedule = await FeeSchedule.query()
      .where('id', feeId)
      .where('school_id', school.id)
      .first()

    if (!feeSchedule) {
      return response.notFound({
        message: 'Fee schedule not found.',
      })
    }

    if (payload.breakdown) {
      const breakdownTotal = Object.values(payload.breakdown).reduce(
        (total, amount) => total + amount,
        0
      )

      if (breakdownTotal !== payload.amount) {
        return response.unprocessableEntity({
          message: 'Fee breakdown total must equal the total fee amount.',
        })
      }
    }

    feeSchedule.merge({
      amount: payload.amount,
      breakdown: payload.breakdown ?? null,
    })

    await feeSchedule.save()

    const user = auth.use('web').user!

    const applicationUser = {
      id: user.userId,
      fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
      email: user.email,
    }

    try {
      const queued = await this.queueFeeScheduleApplication(feeSchedule.id, applicationUser)

      if (!queued) {
        return response.conflict({
          message: 'Fee schedule was updated, but its application is already running.',
        })
      }
    } catch (error) {
      console.error(`Unable to queue fee schedule application for ${feeSchedule.id}:`, error)

      return response.internalServerError({
        message: 'Fee schedule was updated, but its application could not be queued.',
      })
    }

    await feeSchedule.load('class')

    await feeSchedule.load('academicPeriod', (query) => {
      query.preload('academicYear')
    })

    return response.ok({
      message: 'Fee schedule updated successfully and application has been queued.',
      data: FeeScheduleSerializer.serialize(feeSchedule),
    })
  }

  async apply({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school

    const {
      params: { feeId },
    } = await request.validateUsing(feeScheduleParamsValidator)

    const feeSchedule = await FeeSchedule.query()
      .where('id', feeId)
      .where('school_id', school.id)
      .first()

    if (!feeSchedule) {
      return response.notFound({
        message: 'Fee schedule not found.',
      })
    }

    const lock = lockManager.createLock(`fee_schedule_apply:${feeSchedule.id}`, '30m')

    const acquired = await lock.acquireImmediately()

    if (!acquired) {
      return response.conflict({
        message: 'This fee schedule application is already running. Try again later.',
      })
    }

    const user = auth.use('web').user!

    try {
      await ApplyFeeSchedule.dispatch({
        feeScheduleId: feeSchedule.id,
        lock: lock.serialize(),
        user: {
          id: user.userId,
          fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
          email: user.email,
        },
      })
    } catch {
      await lock.release()

      return response.internalServerError({
        message: 'Unable to queue fee schedule application.',
      })
    }

    return response.accepted({
      message: 'Fee schedule application has been queued.',
    })
  }

  async delete({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const {
      params: { feeId },
    } = await request.validateUsing(feeScheduleParamsValidator)

    const feeSchedule = await FeeSchedule.query()
      .where('id', feeId)
      .where('school_id', school.id)
      .first()

    if (!feeSchedule) {
      return response.notFound({
        message: 'Fee schedule not found.',
      })
    }

    try {
      await db.transaction(async (trx) => {
        await FeeStudentLedger.query({ client: trx })
          .where('fee_schedule_id', feeSchedule.id)
          .delete()

        await feeSchedule.useTransaction(trx).delete()
      })
    } catch (error) {
      return response.conflict({
        message: 'This fee schedule cannot be deleted because financial records exist for it.',
      })
    }

    return response.ok({
      message: 'Fee schedule deleted successfully.',
    })
  }

  async synchronize({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school

    const {
      params: { academicPeriodId },
    } = await request.validateUsing(academicPeriodParamsValidator)

    const academicPeriod = await AcademicPeriod.query()
      .where('id', academicPeriodId)
      .where('school_id', school.id)
      .first()

    if (!academicPeriod) {
      return response.notFound({
        message: 'Academic period not found.',
      })
    }

    const feeSchedules = await FeeSchedule.query()
      .where('school_id', school.id)
      .where('academic_period_id', academicPeriod.id)
      .where('status', 'active')

    if (feeSchedules.length === 0) {
      return response.ok({
        message: 'There are no fee schedules to synchronize.',
        data: {
          queued: 0,
          skipped: 0,
        },
      })
    }

    const user = auth.use('web').user!

    const applicationUser = {
      id: user.userId,
      fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
      email: user.email,
    }

    let queued = 0
    let skipped = 0

    for (const feeSchedule of feeSchedules) {
      const dispatched = await this.queueFeeScheduleApplication(feeSchedule.id, applicationUser)

      if (dispatched) {
        queued++
      } else {
        skipped++
      }
    }

    return response.accepted({
      message:
        queued > 0
          ? 'Fee schedule synchronization has been queued.'
          : 'All fee schedule applications are already running.',
      data: {
        queued,
        skipped,
        total: feeSchedules.length,
      },
    })
  }

  private async queueFeeScheduleApplication(
    feeScheduleId: string,
    user: {
      id: string
      fullName: string
      email: string
    }
  ) {
    const lock = lockManager.createLock(`fee_schedule_apply:${feeScheduleId}`, '30m')

    const acquired = await lock.acquireImmediately()

    if (!acquired) {
      return false
    }

    try {
      await ApplyFeeSchedule.dispatch({
        feeScheduleId,
        lock: lock.serialize(),
        user,
      })

      return true
    } catch (error) {
      await lock.release()

      throw error
    }
  }
}
