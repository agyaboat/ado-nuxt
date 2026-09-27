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
// import User from '#models/user'
// import { middleware } from './kernel.ts'
// import UserPolicy from '#policies/user_policy'

// router.get('dl', async ({ response, auth }) => {
//   const b = await User.firstOrFail()
//   await auth.use('web').login(b, true)
//   return response.ok({ message: 'Logged in successfully', user: b })
// })

// router
//   .get('user', async ({ auth, bouncer }) => {
//     if (await bouncer.with(UserPolicy).allows('view', auth.user!)) {
//       return { message: 'You are authorized to view this user.' }
//     }
//     return { message: 'You are not authorized to view this user.' }
//   })
//   .use(middleware.auth({ guards: ['api', 'web'] }))

router.get('fr', () => {
  return true
})

webRoutesEntry() //web
ApiRoutesEntry() //api
