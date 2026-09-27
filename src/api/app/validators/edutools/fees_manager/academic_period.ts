import vine from '@vinejs/vine'

export const academicPeriodParamsValidator = vine.create({
  params: vine.object({
    academicPeriodId: vine.string().uuid(),
  }),
})
