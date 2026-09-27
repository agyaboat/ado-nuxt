import { randomInt, randomUUID } from 'node:crypto'

import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

import User from '#models/user'
import SendSms from '#jobs/send_sms'
import { serializeUserV2 } from '#serializers/user'

const loginValidator = vine.create({
  phone: vine.string().minLength(12).maxLength(12),
})

const verifyOtpValidator = vine.create({
  otp: vine.string().fixedLength(6),
})

const OTP_EXPIRY_MINUTES = 10

export default class AuthV2Controller {
  async signin({ request, response, session }: HttpContext) {
    const { phone } = await request.validateUsing(loginValidator)

    const existingOtp = session.get('auth.otp')

    if (existingOtp && existingOtp.phone === phone && existingOtp.expiresAt > Date.now()) {
      return response.ok({
        success: true,
        otpSent: true,
      })
    }

    const otp = randomInt(100000, 1000000).toString()
    const otpHash = await hash.make(otp)

    session.put('auth.otp', {
      phone,
      otpHash,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    })

    await SendSms.dispatch({
      phoneNumber: phone,
      message: `Your login code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    })

    return response.ok({
      success: true,
      otpSent: true,
    })
  }

  async resendOtp({ response, session }: HttpContext) {
    const pendingOtp = session.get('auth.otp')

    if (!pendingOtp?.phone) {
      return response.badRequest({
        message: 'No active verification request.',
      })
    }

    const otp = randomInt(100000, 1000000).toString()
    const otpHash = await hash.make(otp)

    session.put('auth.otp', {
      phone: pendingOtp.phone,
      otpHash,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    })

    await SendSms.dispatch({
      phoneNumber: pendingOtp.phone,
      message: `Your login code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    })

    return response.ok({
      success: true,
      otpSent: true,
    })
  }

  async verifyOtp({ request, response, session, auth }: HttpContext) {
    const { otp } = await request.validateUsing(verifyOtpValidator)

    const pendingOtp = session.get('auth.otp')

    if (!pendingOtp?.phone) {
      return response.badRequest({
        message: 'No active verification request.',
      })
    }

    if (pendingOtp.expiresAt <= Date.now()) {
      session.forget('auth.otp')

      return response.badRequest({
        message: 'Verification code has expired.',
      })
    }

    const isValid = await hash.verify(pendingOtp.otpHash, otp)

    if (!isValid) {
      return response.badRequest({
        message: 'Invalid verification code.',
      })
    }

    let user = await User.findBy('phone', pendingOtp.phone)

    if (!user) {
      user = await User.create({
        phone: pendingOtp.phone,
        password: randomUUID(),
        email: `${randomUUID()}@placeholder.scholarsaas.com`,
      })
    }

    await auth.use('web').login(user, true)

    session.forget('auth.otp')

    return response.ok({
      success: true,
    })
  }

  async user({ auth, response }: HttpContext) {
    const user = auth.use('web').user

    if (!user) {
      return response.unauthorized({
        message: 'Unauthenticated',
      })
    }

    return response.ok({
      user: serializeUserV2(user),
    })
  }

  async completeSetup({ request, response, auth }: HttpContext) {
    const { firstName, lastName } = await request.validateUsing(
      vine.create({
        firstName: vine.string().trim().minLength(1),
        lastName: vine.string().trim().minLength(1),
      })
    )

    const user = auth.use('web').user!

    user.firstName = firstName
    user.lastName = lastName

    await user.save()

    return response.ok({
      user: serializeUserV2(user),
    })
  }
}
