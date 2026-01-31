import r from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

export function dashAuthRoutes() {
  r.group(() => {
    r.post('', [AuthController, 'login'])
    r.get('user', [AuthController, 'authUser'])
    r.post('verify', [AuthController, 'verify'])
    r.post('register', [AuthController, 'register'])
  }).prefix('auth')
}
