import { EduToolAccessSchema } from '#database/schema'

import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import EduToolInstance from './edu_tool_instance.ts'
import School from './school.ts'
import SchoolUserLedger from './school_user_ledger.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class EduToolAccess extends EduToolAccessSchema {
  @beforeCreate()
  public static assignDefaults(item: EduToolAccess) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => EduToolInstance, {
    foreignKey: 'eduToolInstanceId',
  })
  declare toolInstance: BelongsTo<typeof EduToolInstance>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolUserLedger, {
    foreignKey: 'schoolUserLedgerId',
  })
  declare schoolUserLedger: BelongsTo<typeof SchoolUserLedger>

  @belongsTo(() => User, {
    foreignKey: 'grantedByUserId',
  })
  declare grantedByUser: BelongsTo<typeof User>
}
