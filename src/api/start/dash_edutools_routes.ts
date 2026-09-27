import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.ts'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.get('/tools/market', [controllers.dash.tools.Market, 'index'])
    router.post('/tools/market/:id/subscribe', [controllers.dash.tools.Market, 'subscribe'])
  })
  .prefix('/dash')
  .use(middleware.auth({ guards: ['web'] }))

// router
//   .group(() => {
//     router.get('/tools/:id/runtime', [controllers.dash.tools.Runtime, 'show'])
//   })
//   .prefix('/dash')
//   .use(middleware.auth({ guards: ['web'] }))
