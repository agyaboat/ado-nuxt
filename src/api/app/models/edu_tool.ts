import { EduToolSchema } from '#database/schema'

import { beforeCreate, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import EduToolInstance from './edu_tool_instance.ts'

import { v4 as uuid } from 'uuid'

export default class EduTool extends EduToolSchema {
  @beforeCreate()
  public static assignDefaults(item: EduTool) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @hasMany(() => EduToolInstance, {
    foreignKey: 'eduToolId',
  })
  declare instances: HasMany<typeof EduToolInstance>
}
