import vine from '@vinejs/vine'

export const UserValidator = vine.create({
  //   name: vine.string(),
  //   email: vine.string().email(),
  //   password: vine.string().minLength(8),
  params: vine.object({
    id: vine.string(),
  }),
  headers: vine.object({
    'x-api-key': vine.string(),
  }),
})
