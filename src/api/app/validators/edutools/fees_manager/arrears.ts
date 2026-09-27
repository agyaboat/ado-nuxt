// app/validators/edutools/fees_manager/arrears.ts

import vine from '@vinejs/vine'

export const arrearsQueryValidator = vine.create({
  classId: vine.string().uuid(),

  variantId: vine.string().uuid().nullable().optional(),

  orderBy: vine.enum(['amount_desc', 'amount_asc', 'firstname_asc', 'firstname_desc']),
})
