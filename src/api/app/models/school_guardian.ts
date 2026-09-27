import { SchoolGuardianSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import School from './school.ts'
import SchoolStaff from './school_staff.ts'
import StudentGuardian from './student_guardian.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class SchoolGuardian extends SchoolGuardianSchema {
  @beforeCreate()
  public static assignDefaults(item: SchoolGuardian) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolStaff, {
    foreignKey: 'addedByStaffId',
  })
  declare addedByStaff: BelongsTo<typeof SchoolStaff>

  @belongsTo(() => User, {
    foreignKey: 'addedByUserId',
  })
  declare addedByUser: BelongsTo<typeof User>

  @hasMany(() => StudentGuardian, {
    foreignKey: 'guardianId',
  })
  declare studentGuardians: HasMany<typeof StudentGuardian>
}
