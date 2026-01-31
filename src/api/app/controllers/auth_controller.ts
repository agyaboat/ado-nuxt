import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '../validators/auth.js'
import User from '#models/user'

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await User.create(payload)
    await auth.use('web').login(user)
    return response.created({ message: 'User registered successfully' })
  }

  async login({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)
    if (!user) {
      return response.abort({ message: 'Invalid credentials' })
    }
    await auth.use('web').login(user)
    return response.ok({ message: 'Login successful', user })
  }

  async verify({}: HttpContext) {
    return 'You can verify'
  }

  async authUser({ auth }: HttpContext) {
    return auth.user
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logout successful' })
  }
}
