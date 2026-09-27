import type { HttpContext } from '@adonisjs/core/http'

import WorkspaceResourceSerializer from '#serializers/workspace/resource_serializer'
// import UserWorkspaceResource from '#models/user_workspace_resource'

export default class WorkspaceController {
  async index({ auth, response }: HttpContext) {
    const user = auth.use('web').user

    if (!user) {
      return response.unauthorized({
        message: 'Unauthorized',
      })
    }

    const resources = await user
      .related('workspaceResources')
      .query()
      .preload('toolAccess', (q) => {
        q.preload('toolInstance', (r) => r.preload('tool'))
      })
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    const list = resources.map(WorkspaceResourceSerializer.serialize)

    return response.ok({
      data: {
        list,
        stats: {
          total: list.length,
          suites: list.filter((resource) => resource.resourceType === 'suite').length,
          tools: list.filter((resource) => resource.resourceType === 'tool').length,
        },
      },
    })
  }
}
