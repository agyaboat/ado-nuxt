import { SchoolStudentSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import School from './school.ts'
import SchoolStaff from './school_staff.ts'
import StudentClassEnrollment from './student_class_enrollment.ts'
import StudentGuardian from './student_guardian.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class SchoolStudent extends SchoolStudentSchema {
  @beforeCreate()
  public static assignDefaults(item: SchoolStudent) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => StudentClassEnrollment, {
    foreignKey: 'currentEnrollmentId',
  })
  declare currentEnrollment: BelongsTo<typeof StudentClassEnrollment>

  @belongsTo(() => SchoolStaff, {
    foreignKey: 'addedByStaffId',
  })
  declare addedByStaff: BelongsTo<typeof SchoolStaff>

  @belongsTo(() => User, {
    foreignKey: 'addedByUserId',
  })
  declare addedByUser: BelongsTo<typeof User>

  @hasMany(() => StudentClassEnrollment, {
    foreignKey: 'studentId',
  })
  declare enrollments: HasMany<typeof StudentClassEnrollment>

  @hasMany(() => StudentGuardian, {
    foreignKey: 'studentId',
  })
  declare studentGuardians: HasMany<typeof StudentGuardian>
}
