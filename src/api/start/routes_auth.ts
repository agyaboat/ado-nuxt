import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import r from '@adonisjs/core/services/router'

r.group(() => {
  r.post('', [controllers.Auth, 'login'])
  r.get('user', [controllers.Auth, 'authUser']).use(middleware.auth())
  r.post('verify', [controllers.Auth, 'verify'])
  r.post('register', [controllers.Auth, 'register'])
}).prefix('auth')
