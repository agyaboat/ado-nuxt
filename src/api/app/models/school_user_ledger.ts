import { SchoolUserLedgerSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import EduToolAccess from './edu_tool_access.ts'
import School from './school.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class SchoolUserLedger extends SchoolUserLedgerSchema {
  @beforeCreate()
  public static assignDefaults(item: SchoolUserLedger) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => EduToolAccess, {
    foreignKey: 'schoolUserLedgerId',
  })
  declare toolAccesses: HasMany<typeof EduToolAccess>
}
