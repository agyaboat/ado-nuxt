import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('/signin', [controllers.AuthV2, 'signin'])
    router.post('/verify-otp', [controllers.AuthV2, 'verifyOtp'])
    router.post('/resend-otp', [controllers.AuthV2, 'resendOtp'])
    // router.get('/user', [controllers.AuthV2, 'user']).use([middleware.auth({ guards: ['web'] })])

    router.any('logout', ({ auth }) => {
      auth.use('web').logout()
    })

    router
      .group(() => {
        router.get('/user', [controllers.AuthV2, 'user'])
        router.patch('/profile', [controllers.AuthV2, 'completeSetup'])
      })
      .use([middleware.auth({ guards: ['web'] })])
  })
  .prefix('/auth')

router
  .group(() => {
    router.patch('basic-details', [controllers.UserSettings, 'updateBasicDetails'])
    router.post('password', [controllers.UserSettings, 'setPassword'])
    router.patch('password', [controllers.UserSettings, 'changePassword'])

    router.post('phone/change/request', [controllers.UserSettings, 'requestPhoneChange'])

    router.post('phone/change', [controllers.UserSettings, 'confirmPhoneChange'])
  })
  .prefix('user/settings')
  .use([middleware.auth({ guards: ['web'] })])
