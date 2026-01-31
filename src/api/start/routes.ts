/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { webRoutesEntry } from '../routes/web/index.js'
import { ApiRoutesEntry } from '../routes/api/index.js'

router.get('', ({ request }: HttpContext) => {
  return { hello: 'world', request: request.all() }
})

router.get('login', () => {
  return { hello: 'Maybe we are still working on this page and not done' }
})

router.get('fr', () => {
  //dummy route for csrf token fetching from nuxt frontend
  return true
})

webRoutesEntry() //web
ApiRoutesEntry() //api
