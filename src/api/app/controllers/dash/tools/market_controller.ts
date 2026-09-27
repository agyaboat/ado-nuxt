import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

import EduTool from '#models/edu_tool'
import EduToolInstance from '#models/edu_tool_instance'
import { getMarketValidator, subscribeValidator } from '#validators/dash/market'
import { serializeMarketTool } from '#serializers/dash/market'
import School from '#models/school'
import { generateSchoolCode, generateUniqueSchoolSlug } from '#helpers/utils'
import { DateTime } from 'luxon'
import EduToolAccess from '#models/edu_tool_access'
import UserWorkspaceResource from '#models/user_workspace_resource'

export default class MarketController {
  async index({ auth, request, response }: HttpContext) {
    const user = auth.use('web').user

    if (!user) {
      return response.unauthorized({
        message: 'Unauthorized',
      })
    }

    const { search, category, type } = await request.validateUsing(getMarketValidator)

    const toolsQ = EduTool.query().where('status', 'active').where('is_market_visible', true)

    if (category && category !== 'all') {
      toolsQ.where('category', category)
    }

    if (type) {
      toolsQ.where('type', type)
    }

    if (search) {
      const term = `%${search}%`

      toolsQ.where((q) => {
        q.whereLike('key', term)
          .orWhereLike('label', term)
          .orWhereLike('category', term)
          .orWhereLike('description', term)
      })
    }

    const tools = await toolsQ
      .orderBy('is_featured', 'desc')
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    return response.ok({
      data: tools.map(serializeMarketTool),
    })
  }

  async subscribe({ auth, response, request }: HttpContext) {
    const user = auth.use('web').user

    if (!user) {
      return response.unauthorized({
        message: 'Unauthorized',
      })
    }

    const { schoolName, params } = await request.validateUsing(subscribeValidator)

    const tool = await EduTool.query()
      .where('id', params.id)
      .where('status', 'active')
      .where('is_market_visible', true)
      .first()

    if (!tool) {
      return response.notFound({
        message: 'Tool not found or not available.',
      })
    }

    const [code, slug] = await Promise.all([
      generateSchoolCode(5, '1234567890'),
      generateUniqueSchoolSlug(schoolName),
    ])

    let accessId = ''

    await db.transaction(async (trx) => {
      const school = new School()

      school.merge({
        name: schoolName,
        isPlaceholder: true,
        provisioningType: 'auto',
        code,
        slug,
      })

      school.useTransaction(trx)
      await school.save()

      const instance = new EduToolInstance()

      instance.merge({
        schoolId: school.id,
        eduToolId: tool.id,

        costPerMonth: tool.standardPricePerMonth,

        status: 'pending_setup',

        activatedAt: null,
        deactivatedAt: null,
        startsAt: null,
        endsAt: null,
        trialEndsAt: null,
        cancelledAt: null,
        expiredAt: null,

        entitlements: null,
        entitlementsVersion: 1,

        config: tool.defaultConfig,

        meta: {
          source: 'market',
          setup_required: true,
        },

        createdByUserId: user.userId,
      })

      instance.useTransaction(trx)
      await instance.save()

      const staff = await school.related('staffs').create({
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        employmentInfo: {
          job_title: 'admin',
        },
        addedByUserId: user.userId,
        email: user.email,
      })

      const ledger = await school.related('userLedgers').create({
        accountType: 'staff',
        typeId: staff.id,
        userId: user.userId,
        linkedAt: DateTime.now(),
      })

      const toolAccess = new EduToolAccess()

      toolAccess.merge({
        userId: user.userId,
        schoolId: school.id,
        schoolUserLedgerId: ledger.id,
        eduToolInstanceId: instance.id,

        meta: {
          label: tool.label,
          sublabel: school.name,
        },
      })

      toolAccess.useTransaction(trx)
      await toolAccess.save()

      const workspaceResource = new UserWorkspaceResource()

      workspaceResource.merge({
        label: tool.label,
        sublabel: school.name,
        resourceType: 'tool',
        resourceId: toolAccess.id,
        userId: user.userId,
        schoolId: school.id,
      })

      workspaceResource.useTransaction(trx)
      await workspaceResource.save()

      accessId = workspaceResource.id
    })

    return response.created({
      message: 'Tool added successfully.',
      accessId,
    })
  }
}
