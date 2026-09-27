import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.ts'
// import EduToolInstance from '#models/edu_tool_instance'
import EduTool from '#models/edu_tool'
import { serializeEduTool } from '#serializers/admin/edutools'
import UserWorkspaceResource from '#models/user_workspace_resource'

router
  .group(() => {
    router.get('/edu-tools', [controllers.admin.EduTools, 'index'])
    router.post('/edu-tools', [controllers.admin.EduTools, 'store'])
    router.get('/edu-tools/:id', [controllers.admin.EduTools, 'show'])
    router.put('/edu-tools/:id', [controllers.admin.EduTools, 'update'])
    router.patch('/edu-tools/:id/status', [controllers.admin.EduTools, 'updateStatus'])
    router.delete('/edu-tools/:id', [controllers.admin.EduTools, 'destroy'])
  })
  .prefix('/dash/admin')
  .use(middleware.auth({ guards: ['web'] }))

router.get('ms', async () => {
  const ins = await UserWorkspaceResource.all()
  return ins
})

router.get('ma', async () => {
  const toolsQ = await EduTool.query()
    .withCount('instances', (query) => {
      query.as('instancesCount')
    })
    .withCount('instances', (query) => {
      query.where('status', 'active').as('activeInstancesCount')
    })

  console.log(toolsQ)

  return toolsQ.map(serializeEduTool)
})
