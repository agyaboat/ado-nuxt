import vine from '@vinejs/vine'

const TOOL_STATUSES = ['active', 'inactive', 'deprecated', 'archived'] as const

const TOOL_FIELDS = {
  key: vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(100)
    .regex(/^[a-z0-9_]+$/),

  label: vine.string().trim().minLength(1).maxLength(255),

  description: vine.string().trim().maxLength(10000).nullable(),

  category: vine.string().trim().maxLength(50).nullable(),

  status: vine.enum(TOOL_STATUSES),

  isMarketVisible: vine.boolean(),

  isFeatured: vine.boolean(),

  standardPricePerMonth: vine.number().min(0),

  proPricePerMonth: vine.number().min(0).nullable(),

  proAvailable: vine.boolean(),

  sortOrder: vine.number().min(0).nullable(),

  image: vine.file({ size: '2mb', extnames: ['jpg', 'jpeg', 'png', 'webp', 'svg'] }).nullable(),

  defaultConfig: vine.any().nullable(),

  meta: vine.any().nullable(),
}

export const getEduToolsValidator = vine.create({
  search: vine.string().trim().maxLength(100).optional(),

  category: vine.string().trim().maxLength(50).optional(),

  status: vine.enum(TOOL_STATUSES).optional(),
})

export const createEduToolValidator = vine.create({
  ...TOOL_FIELDS,

  description: TOOL_FIELDS.description.optional(),
  category: TOOL_FIELDS.category.optional(),
  status: TOOL_FIELDS.status.optional(),
  isMarketVisible: TOOL_FIELDS.isMarketVisible.optional(),
  isFeatured: TOOL_FIELDS.isFeatured.optional(),
  standardPricePerMonth: TOOL_FIELDS.standardPricePerMonth.optional(),
  proPricePerMonth: TOOL_FIELDS.proPricePerMonth.optional(),
  proAvailable: TOOL_FIELDS.proAvailable.optional(),
  sortOrder: TOOL_FIELDS.sortOrder.optional(),
  image: TOOL_FIELDS.image.optional(),
  defaultConfig: TOOL_FIELDS.defaultConfig.optional(),
  meta: TOOL_FIELDS.meta.optional(),
})

export const updateEduToolValidator = vine.create({
  key: TOOL_FIELDS.key.optional(),
  label: TOOL_FIELDS.label.optional(),
  description: TOOL_FIELDS.description.optional(),
  category: TOOL_FIELDS.category.optional(),
  status: TOOL_FIELDS.status.optional(),
  isMarketVisible: TOOL_FIELDS.isMarketVisible.optional(),
  isFeatured: TOOL_FIELDS.isFeatured.optional(),
  standardPricePerMonth: TOOL_FIELDS.standardPricePerMonth.optional(),
  proPricePerMonth: TOOL_FIELDS.proPricePerMonth.optional(),
  proAvailable: TOOL_FIELDS.proAvailable.optional(),
  sortOrder: TOOL_FIELDS.sortOrder.optional(),
  image: TOOL_FIELDS.image.optional(),
  defaultConfig: TOOL_FIELDS.defaultConfig.optional(),
  meta: TOOL_FIELDS.meta.optional(),
})

export const updateEduToolStatusValidator = vine.create({
  status: vine.enum(TOOL_STATUSES),
})
