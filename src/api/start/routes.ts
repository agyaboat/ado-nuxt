/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

// import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { webRoutesEntry } from '../routes/web/index.js'
import { ApiRoutesEntry } from '../routes/api/index.js'
import { controllers } from '#generated/controllers'
import User from '#models/user'
import { middleware } from './kernel.ts'
import UserPolicy from '#policies/user_policy'
// import { UAParser } from 'ua-parser-js'
// import { UserValidator } from '#validators/user'

router.get('dl', async ({ response, auth }) => {
  // return response.attachment('public/hello.jpg', 'Bright.jpg')
  const b = await User.firstOrFail()
  await auth.use('web').login(b, true)
  return response.ok({ message: 'Logged in successfully', user: b })
})

router
  .get('user', async ({ auth, bouncer }) => {
    if (await bouncer.with(UserPolicy).allows('view', auth.user!) ) {
      return { message: 'You are authorized to view this user.' }
    }
    return { message: 'You are not authorized to view this user.' }
  })
  .use(middleware.auth({ guards: ['api', 'web'] }))

router.get('fr', () => {
  return true
})

router.get('/github/redirect', ({ ally }) => {
  return ally.use('github').redirect((request) => {
    request.scopes(['user:email', 'read:user'])
  })
})

router.get('/github/callback', async ({ ally, response }) => {
  const github = ally.use('github')

  /**
   * User cancelled the authentication flow
   */
  if (github.accessDenied()) {
    return 'Access denied. You cancelled the login process.'
  }

  /**
   * OAuth state verification failed (possible CSRF attack)
   */
  if (github.stateMisMatch()) {
    return 'State mismatch. Request may have been tampered with.'
  }

  /**
   * Provider returned an error
   */
  if (github.hasError()) {
    return github.getError()
  }

  /**
   * Get the authenticated user's information
   */
  const githubUser = await github.user()

  return githubUser
})

// router.resource('users', controllers.Users)

webRoutesEntry() //web
ApiRoutesEntry() //api
