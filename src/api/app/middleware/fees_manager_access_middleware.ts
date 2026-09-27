import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

import EduToolAccess from '#models/edu_tool_access'
import type EduToolInstance from '#models/edu_tool_instance'
import type School from '#models/school'
import vine from '@vinejs/vine'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    feesManager: {
      access: EduToolAccess
      instance: EduToolInstance
      school: School
    }
  }
}

export default class FeesManagerAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.use('web').user

    if (!user) {
      return ctx.response.unauthorized({
        message: 'Unauthorized',
      })
    }

    const {
      params: { accessId },
    } = await ctx.request.validateUsing(
      vine.create({
        params: vine.object({
          accessId: vine.string().uuid(),
        }),
      })
    )

    if (!accessId) {
      return ctx.response.badRequest({
        message: 'Tool access ID is required.',
      })
    }

    const access = await EduToolAccess.query()
      .where('id', accessId)
      .where('user_id', user.userId)
      .where('status', 'active')
      .preload('toolInstance', (query) => {
        query.preload('tool').preload('school')
      })
      .first()

    if (!access) {
      return ctx.response.forbidden({
        message: 'You do not have access to this tool.',
      })
    }

    const instance = access.toolInstance

    if (!instance || instance.tool.key !== 'fees_manager') {
      return ctx.response.forbidden({
        message: 'This access does not belong to Fees Manager.',
      })
    }

    if (!['active', 'pending_setup'].includes(instance.status)) {
      return ctx.response.forbidden({
        message: 'This Fees Manager instance is not available.',
      })
    }

    ctx.feesManager = {
      access,
      instance,
      school: instance.school,
    }

    await next()
  }
}
