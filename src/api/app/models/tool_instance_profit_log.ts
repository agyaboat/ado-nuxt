import { ToolInstanceProfitLogSchema } from '#database/schema'

import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import EduToolInstance from './edu_tool_instance.ts'

import { v4 as uuid } from 'uuid'

export default class ToolInstanceProfitLog extends ToolInstanceProfitLogSchema {
  @beforeCreate()
  public static assignDefaults(item: ToolInstanceProfitLog) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => EduToolInstance, {
    foreignKey: 'eduToolInstanceId',
  })
  declare toolInstance: BelongsTo<typeof EduToolInstance>
}
