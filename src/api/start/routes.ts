/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import User from '#models/user'
import router from '@adonisjs/core/services/router'

// generate preload into routes/* rather for a scalable approach

router.get('a', () => {
  return User.all()
})
