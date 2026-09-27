import vine from '@vinejs/vine'

export const dashboardValidator = vine.create({
  params: vine.object({
    academicPeriodId: vine.string().uuid(),
  }),
})
