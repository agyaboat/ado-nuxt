import { UserWorkspaceResourceSchema } from '#database/schema'

import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import EduToolAccess from './edu_tool_access.ts'
import School from './school.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class UserWorkspaceResource extends UserWorkspaceResourceSchema {
  @beforeCreate()
  public static assignDefaults(item: UserWorkspaceResource) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => EduToolAccess, {
    foreignKey: 'resourceId',
  })
  declare toolAccess: BelongsTo<typeof EduToolAccess>
}
