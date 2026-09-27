import { SchoolClassGroupSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import School from './school.ts'
import SchoolClass from './school_class.ts'

import { v4 as uuid } from 'uuid'

export default class SchoolClassGroup extends SchoolClassGroupSchema {
  @beforeCreate()
  public static assignDefaults(item: SchoolClassGroup) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @hasMany(() => SchoolClass, {
    foreignKey: 'classGroupId',
  })
  declare classes: HasMany<typeof SchoolClass>
}
