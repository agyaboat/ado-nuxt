import { StudentGuardianSchema } from '#database/schema'

import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import School from './school.ts'
import SchoolGuardian from './school_guardian.ts'
import SchoolStaff from './school_staff.ts'
import SchoolStudent from './school_student.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class StudentGuardian extends StudentGuardianSchema {
  @beforeCreate()
  public static assignDefaults(item: StudentGuardian) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolStudent, {
    foreignKey: 'studentId',
  })
  declare student: BelongsTo<typeof SchoolStudent>

  @belongsTo(() => SchoolGuardian, {
    foreignKey: 'guardianId',
  })
  declare guardian: BelongsTo<typeof SchoolGuardian>

  @belongsTo(() => SchoolStaff, {
    foreignKey: 'addedByStaffId',
  })
  declare addedByStaff: BelongsTo<typeof SchoolStaff>

  @belongsTo(() => User, {
    foreignKey: 'addedByUserId',
  })
  declare addedByUser: BelongsTo<typeof User>
}
