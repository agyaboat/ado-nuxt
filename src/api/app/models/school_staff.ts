import { SchoolStaffSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import AcademicPeriod from './academic_period.ts'
import AcademicYear from './academic_year.ts'
import School from './school.ts'
import SchoolGuardian from './school_guardian.ts'
import StudentClassEnrollment from './student_class_enrollment.ts'
import StudentGuardian from './student_guardian.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class SchoolStaff extends SchoolStaffSchema {
  @beforeCreate()
  public static assignDefaults(item: SchoolStaff) {
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

  @hasMany(() => SchoolStaff, {
    foreignKey: 'addedByStaffId',
  })
  declare addedStaff: HasMany<typeof SchoolStaff>

  @belongsTo(() => User, {
    foreignKey: 'addedByUserId',
  })
  declare addedByUser: BelongsTo<typeof User>

  @hasMany(() => AcademicPeriod, {
    foreignKey: 'createdByStaffId',
  })
  declare createdAcademicPeriods: HasMany<typeof AcademicPeriod>

  @hasMany(() => AcademicYear, {
    foreignKey: 'createdByStaffId',
  })
  declare createdAcademicYears: HasMany<typeof AcademicYear>

  @hasMany(() => SchoolGuardian, {
    foreignKey: 'addedByStaffId',
  })
  declare addedGuardians: HasMany<typeof SchoolGuardian>

  @hasMany(() => StudentClassEnrollment, {
    foreignKey: 'addedByStaffId',
  })
  declare addedStudentClassEnrollments: HasMany<typeof StudentClassEnrollment>

  @hasMany(() => StudentGuardian, {
    foreignKey: 'addedByStaffId',
  })
  declare addedStudentGuardians: HasMany<typeof StudentGuardian>
}
