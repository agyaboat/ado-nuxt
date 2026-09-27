import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import EduTool from '#models/edu_tool'
import {
  createEduToolValidator,
  getEduToolsValidator,
  updateEduToolStatusValidator,
  updateEduToolValidator,
} from '#validators/admin/edutools'
import { serializeEduTool } from '#serializers/admin/edutools'
import type User from '#models/user'
import { randomUUID } from 'node:crypto'
import env from '#start/env'

export default class EduToolsController {
  private ensureAdmin(user: User | undefined, response: HttpContext['response']) {
    if (!user) {
      return response.unauthorized({
        message: 'Unauthorized',
      })
    }

    if (!['boss', 'admin', 'super'].includes(user.role)) {
      return response.forbidden({
        message: 'You are not allowed to manage platform tools.',
      })
    }

    return null
  }

  async index({ auth, request, response }: HttpContext) {
    const user = auth.use('web').user!

    const blocked = this.ensureAdmin(user, response)
    if (blocked) return blocked

    const filters = await request.validateUsing(getEduToolsValidator)

    const toolsQ = EduTool.query()
      .withCount('instances', (query) => {
        query.as('instancesCount')
      })
      .withCount('instances', (query) => {
        query.where('status', 'active').as('activeInstancesCount')
      })

    if (filters.status) {
      toolsQ.where('status', filters.status)
    }

    if (filters.category) {
      toolsQ.where('category', filters.category)
    }

    if (filters.search) {
      const term = `%${filters.search}%`

      toolsQ.where((query) => {
        query
          .whereLike('key', term)
          .orWhereLike('label', term)
          .orWhereLike('category', term)
          .orWhereLike('description', term)
      })
    }

    const tools = await toolsQ.orderBy('sort_order', 'asc').orderBy('created_at', 'desc')

    return response.ok({
      data: tools.map(serializeEduTool),
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.use('web').user!

    const blocked = this.ensureAdmin(user, response)
    if (blocked) return blocked

    const { image, ...payload } = await request.validateUsing(createEduToolValidator)

    const existingTool = await EduTool.query().where('key', payload.key).first()

    if (existingTool) {
      return response.conflict({
        message: 'A tool with this key already exists.',
      })
    }

    let imageData = null

    if (image) {
      const key = randomUUID()
      const disk = env.get('DRIVE_DISK')

      await image.moveToDisk(key, disk)

      imageData = {
        key,
        disk,
      }
    }

    const tool = await EduTool.create({
      ...payload,
      image: imageData,
      createdByUserId: user.userId,
    })

    await tool.refresh()

    return response.created({
      message: 'Tool registered successfully.',
      data: serializeEduTool(tool),
    })
  }

  async show({ auth, params, response }: HttpContext) {
    const user = auth.use('web').user

    const blocked = this.ensureAdmin(user, response)
    if (blocked) return blocked

    const tool = await EduTool.query()
      .where('id', params.id)
      .withCount('instances', (query) => {
        query.as('instancesCount')
      })
      .withCount('instances', (query) => {
        query.where('status', 'active').as('activeInstancesCount')
      })
      .firstOrFail()

    return response.ok({
      data: serializeEduTool(tool),
    })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.use('web').user

    const blocked = this.ensureAdmin(user, response)
    if (blocked) return blocked

    const tool = await EduTool.findOrFail(params.id)

    const { image, ...payload } = await request.validateUsing(updateEduToolValidator)

    if (payload.key !== undefined && payload.key !== tool.key) {
      const existingTool = await EduTool.query()
        .where('key', payload.key)
        .whereNot('id', tool.id)
        .first()

      if (existingTool) {
        return response.conflict({
          message: 'A tool with this key already exists.',
        })
      }
    }

    const oldImage = tool.image
    let newImage: { key: string; disk: string } | null = null

    if (image) {
      const key = randomUUID()
      const disk = env.get('DRIVE_DISK')

      await image.moveToDisk(key, disk)

      newImage = {
        key,
        disk,
      }

      tool.image = JSON.stringify(newImage)
    }

    tool.merge(payload)

    try {
      await tool.save()
    } catch (error) {
      if (newImage) {
        type DiskType = 'fs' | 'r2'
        await drive.use(newImage.disk as DiskType).delete(newImage.key)
      }

      throw error
    }

    if (newImage && oldImage?.key && oldImage?.disk) {
      await drive.use(oldImage.disk).delete(oldImage.key)
    }

    await tool.refresh()

    return response.ok({
      message: 'Tool updated successfully.',
      data: serializeEduTool(tool),
    })
  }

  async updateStatus({ auth, params, request, response }: HttpContext) {
    const user = auth.use('web').user

    const blocked = this.ensureAdmin(user, response)
    if (blocked) return blocked

    const tool = await EduTool.findOrFail(params.id)

    const payload = await request.validateUsing(updateEduToolStatusValidator)

    tool.status = payload.status

    await tool.save()
    await tool.refresh()

    return response.ok({
      message: 'Tool status updated successfully.',
      data: serializeEduTool(tool),
    })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.use('web').user

    const blocked = this.ensureAdmin(user, response)
    if (blocked) return blocked

    const tool = await EduTool.findOrFail(params.id)

    const instancesCount = await tool.related('instances').query().count('* as total').first()

    const total = Number(instancesCount?.$extras.total || 0)

    if (total > 0) {
      return response.badRequest({
        message: 'This tool already has instances. Archive or deprecate it instead of deleting.',
      })
    }

    const oldImage = tool.image

    await tool.delete()

    if (oldImage?.key && oldImage?.disk) {
      await drive.use(oldImage.disk).delete(oldImage.key)
    }

    return response.ok({
      message: 'Tool deleted successfully.',
    })
  }
}
