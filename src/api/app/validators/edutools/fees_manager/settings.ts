// validators/edutools/fees_manager/settings.ts

import vine from '@vinejs/vine'

export const updateSchoolSettings = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),

  phone: vine.string().trim().maxLength(50).nullable().optional(),
  email: vine.string().trim().email().maxLength(255).nullable().optional(),
  website: vine.string().trim().maxLength(255).nullable().optional(),

  country: vine.string().trim().maxLength(100).nullable().optional(),
  region: vine.string().trim().maxLength(100).nullable().optional(),
  town: vine.string().trim().maxLength(100).nullable().optional(),

  venueDetails: vine
    .object({
      country: vine.string().trim().maxLength(100).nullable().optional(),
      region: vine.string().trim().maxLength(100).nullable().optional(),
      town: vine.string().trim().maxLength(100).nullable().optional(),
      address: vine.string().trim().maxLength(500).nullable().optional(),
    })
    .nullable()
    .optional(),
})
