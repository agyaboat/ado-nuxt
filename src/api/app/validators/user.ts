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

export const userBasicSettings = vine.create({
  firstName: vine.string().trim().minLength(1),
  middleName: vine.string().trim().optional(),
  lastName: vine.string().trim().minLength(1),
})

export const userSetPassword = vine.create({
  password: vine.string().minLength(8),
})

export const userChangePassword = vine.create({
  currentPassword: vine.string().minLength(1),
  password: vine.string().minLength(8),
})

export const userChangePhone = vine.create({
  phone: vine.string().regex(/^233(20|24|25|26|27|28|50|53|54|55|56|57|59)\d{7}$/),

  password: vine.string().optional(),
})

export const userConfirmPhoneChange = vine.create({
  phone: vine.string().regex(/^233(20|24|25|26|27|28|50|53|54|55|56|57|59)\d{7}$/),

  otp: vine.string().fixedLength(6),
})
