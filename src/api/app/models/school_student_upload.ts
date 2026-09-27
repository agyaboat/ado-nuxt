import { SchoolStudentUploadSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import School from './school.ts'
import SchoolClass from './school_class.ts'
import User from './user.ts'
import { v4 as uuid } from 'uuid'

export default class SchoolStudentUpload extends SchoolStudentUploadSchema {
  @beforeCreate()
  public static assignDefaults(item: SchoolStudentUpload) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolClass, {
    foreignKey: 'classId',
  })
  declare schoolClass: BelongsTo<typeof SchoolClass>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
}
