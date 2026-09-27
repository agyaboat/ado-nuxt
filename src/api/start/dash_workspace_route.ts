import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.ts'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.get('/workspace', [controllers.dash.Workspace, 'index'])
  })
  .prefix('/dash')
  .use(middleware.auth({ guards: ['web'] }))
