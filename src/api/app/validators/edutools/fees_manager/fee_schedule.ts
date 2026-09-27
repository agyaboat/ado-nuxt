import vine from '@vinejs/vine'

export const indexFeeSchedulesValidator = vine.create({
  page: vine.number().min(1).optional(),
  limit: vine.number().min(1).max(100).optional(),
  search: vine.string().trim().maxLength(100).optional(),
  academicPeriodId: vine.string().uuid().optional(),
  classId: vine.string().uuid().optional(),
  accommodation: vine.string().trim().maxLength(50).optional(),
})

export const createFeeScheduleValidator = vine.create({
  academicPeriodId: vine.string().uuid(),
  classId: vine.string().uuid(),
  accommodationType: vine.enum(['day', 'boarding']),
  amount: vine.number().min(1),
  breakdown: vine.record(vine.number().min(1)).nullable().optional(),
})

export const updateFeeScheduleValidator = vine.create({
  amount: vine.number().min(1),
  breakdown: vine.record(vine.number().min(1)).nullable().optional(),
})

export const feeScheduleParamsValidator = vine.create({
  params: vine.object({
    feeId: vine.string().uuid(),
  }),
})
