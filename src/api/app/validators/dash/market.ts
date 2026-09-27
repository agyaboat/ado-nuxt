import vine from '@vinejs/vine'

export const getMarketValidator = vine.create({
  category: vine.string().optional().nullable(),
  type: vine.enum(['tool', 'suite']).optional().nullable(),
  search: vine.string().optional().nullable(),
})

export const subscribeValidator = vine.create({
  schoolName: vine.string().minLength(2),
  params: vine.object({
    id: vine.string().uuid(),
  }),
})
