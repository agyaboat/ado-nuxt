import vine from '@vinejs/vine'

export const createSchoolClassValidator = vine.create({
  label: vine.string().trim().minLength(1).maxLength(255),
  parentId: vine.string().uuid().nullable(),
})

export const updateSchoolClassValidator = vine.create({
  label: vine.string().trim().minLength(1).maxLength(255),
  parentId: vine.string().uuid().nullable(),
  params: vine.object({
    classId: vine.string().uuid(),
  }),
})

export const reorderSchoolClassesValidator = vine.create({
  classIds: vine.array(vine.string().uuid()).minLength(1).distinct(),
})

export const deleteSchoolClassValidator = vine.create({
  params: vine.object({
    classId: vine.string().uuid(),
  }),
})

export const classParamsValidator = vine.create({
  params: vine.object({
    classId: vine.string().uuid(),
  }),
})
