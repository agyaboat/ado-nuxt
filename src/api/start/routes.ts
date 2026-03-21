/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { webRoutesEntry } from '../routes/web/index.js'
import { ApiRoutesEntry } from '../routes/api/index.js'
import { controllers } from '#generated/controllers'
// import { UAParser } from 'ua-parser-js'
import { UserValidator } from '#validators/user'

router.any('/:id', async ({ request }: HttpContext) => {
  const payload = await request.validateUsing(UserValidator)
  return { hello: 'AdoNuxt', query: request.qs(), payload: payload.headers['x-api-key'] }
})

router.get('dl', ({ response }) => {
  return response.attachment('/hello.jpg')
})

router.get('login', () => {
  return { hello: 'Maybe we are still working on this page and not done' }
})

router.get('fr', () => {
  return true
})

router.resource('users', controllers.Users)

webRoutesEntry() //web
ApiRoutesEntry() //api
