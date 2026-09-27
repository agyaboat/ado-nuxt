import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'

import { serializeUserV2 } from '#serializers/user'
import {
  userBasicSettings,
  userChangePassword,
  userChangePhone,
  userConfirmPhoneChange,
  userSetPassword,
} from '#validators/user'
import User from '#models/user'
import { randomInt } from 'node:crypto'
import SendSms from '#jobs/send_sms'

export default class UserSettingsController {
  async updateBasicDetails({ request, response, auth }: HttpContext) {
    const { firstName, middleName, lastName } = await request.validateUsing(userBasicSettings)

    const user = auth.use('web').user!

    user.firstName = firstName
    user.middleName = middleName || null
    user.lastName = lastName

    await user.save()

    return response.ok({
      user: serializeUserV2(user),
    })
  }

  async setPassword({ request, response, auth }: HttpContext) {
    const { password } = await request.validateUsing(userSetPassword)

    const user = auth.use('web').user!

    user.password = password

    user.configs = JSON.stringify({
      ...(user.configs ?? {}),
      passwordSet: true,
    })

    await user.save()

    return response.ok({
      user: serializeUserV2(user),
    })
  }

  async changePassword({ request, response, auth }: HttpContext) {
    const { currentPassword, password } = await request.validateUsing(userChangePassword)

    const user = auth.use('web').user!

    const isValid = await user.verifyPassword(currentPassword)

    if (!isValid) {
      return response.badRequest({
        message: 'Current password is incorrect.',
      })
    }

    user.password = password

    await user.save()

    return response.ok({
      user: serializeUserV2(user),
    })
  }

  async requestPhoneChange({ request, response, auth, session }: HttpContext) {
    const { phone, password } = await request.validateUsing(userChangePhone)

    const user = auth.use('web').user!

    const passwordSet = user.configs?.passwordSet ?? false

    if (passwordSet) {
      if (!password) {
        return response.badRequest({
          message: 'Your current password is required.',
        })
      }

      const isValid = await user.verifyPassword(password)

      if (!isValid) {
        return response.badRequest({
          message: 'Current password is incorrect.',
        })
      }
    }

    if (user.phone === phone) {
      return response.badRequest({
        message: 'This is already your current phone number.',
      })
    }

    const existingUser = await User.findBy('phone', phone)

    if (existingUser && existingUser.id !== user.id) {
      return response.badRequest({
        message: 'This phone number is already in use.',
      })
    }

    const otp = randomInt(100000, 1000000).toString()
    const otpHash = await hash.make(otp)

    session.put('settings.phoneChange', {
      userId: user.id,
      phone,
      otpHash,
      expiresAt: Date.now() + 10 * 60 * 1000,
    })

    await SendSms.dispatch({
      phoneNumber: phone,
      message: `Your phone verification code is ${otp}. It expires in 10 minutes.`,
    })

    return response.ok({
      success: true,
      otpSent: true,
    })
  }

  async confirmPhoneChange({ request, response, auth, session }: HttpContext) {
    const { phone, otp } = await request.validateUsing(userConfirmPhoneChange)

    const user = auth.use('web').user!

    const pendingChange = session.get('settings.phoneChange')

    if (!pendingChange) {
      return response.badRequest({
        message: 'No active phone change request.',
      })
    }

    if (pendingChange.userId !== user.id || pendingChange.phone !== phone) {
      return response.badRequest({
        message: 'Invalid phone change request.',
      })
    }

    if (pendingChange.expiresAt <= Date.now()) {
      session.forget('settings.phoneChange')

      return response.badRequest({
        message: 'Verification code has expired.',
      })
    }

    const isValid = await hash.verify(pendingChange.otpHash, otp)

    if (!isValid) {
      return response.badRequest({
        message: 'Invalid verification code.',
      })
    }

    const existingUser = await User.findBy('phone', phone)

    if (existingUser && existingUser.id !== user.id) {
      session.forget('settings.phoneChange')

      return response.badRequest({
        message: 'This phone number is already in use.',
      })
    }

    user.phone = phone

    await user.save()

    session.forget('settings.phoneChange')

    return response.ok({
      user: serializeUserV2(user),
    })
  }
}
