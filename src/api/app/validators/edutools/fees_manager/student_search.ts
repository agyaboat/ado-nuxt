import vine from '@vinejs/vine'

export const studentSearchValidator = vine.create({
  q: vine.string().trim().maxLength(100),
})
