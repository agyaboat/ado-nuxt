import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    first_name: vine.string().trim().minLength(2).maxLength(100),
    last_name: vine.string().trim().minLength(2).maxLength(100),
    email: vine.string().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(5),
  })
)
