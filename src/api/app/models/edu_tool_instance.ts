import { EduToolInstanceSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import EduTool from './edu_tool.ts'
import EduToolAccess from './edu_tool_access.ts'
import School from './school.ts'

import { v4 as uuid } from 'uuid'

export default class EduToolInstance extends EduToolInstanceSchema {
  @beforeCreate()
  public static assignDefaults(item: EduToolInstance) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => EduTool, {
    foreignKey: 'eduToolId',
  })
  declare tool: BelongsTo<typeof EduTool>

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @hasMany(() => EduToolAccess, {
    foreignKey: 'eduToolInstanceId',
  })
  declare accesses: HasMany<typeof EduToolAccess>
}
