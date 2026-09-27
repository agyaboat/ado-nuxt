import { SchoolSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import AcademicPeriod from './academic_period.ts'
import AcademicYear from './academic_year.ts'
import EduToolAccess from './edu_tool_access.ts'
import EduToolInstance from './edu_tool_instance.ts'
import SchoolGuardian from './school_guardian.ts'
import SchoolStaff from './school_staff.ts'
import SchoolStudent from './school_student.ts'
import SchoolUserLedger from './school_user_ledger.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class School extends SchoolSchema {
  @beforeCreate()
  public static assignDefaults(item: School) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => AcademicPeriod, {
    foreignKey: 'currentAcademicPeriodId',
  })
  declare currentAcademicPeriod: BelongsTo<typeof AcademicPeriod>

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'createdByUserId',
  })
  declare createdByUser: BelongsTo<typeof User>

  @hasMany(() => AcademicYear, {
    foreignKey: 'schoolId',
  })
  declare academicYears: HasMany<typeof AcademicYear>

  @hasMany(() => AcademicPeriod, {
    foreignKey: 'schoolId',
  })
  declare academicPeriods: HasMany<typeof AcademicPeriod>

  @hasMany(() => SchoolStaff, {
    foreignKey: 'schoolId',
  })
  declare staffs: HasMany<typeof SchoolStaff>

  @hasMany(() => SchoolStudent, {
    foreignKey: 'schoolId',
  })
  declare students: HasMany<typeof SchoolStudent>

  @hasMany(() => SchoolGuardian, {
    foreignKey: 'schoolId',
  })
  declare guardians: HasMany<typeof SchoolGuardian>

  @hasMany(() => SchoolUserLedger, {
    foreignKey: 'schoolId',
  })
  declare userLedgers: HasMany<typeof SchoolUserLedger>

  @hasMany(() => EduToolInstance, {
    foreignKey: 'schoolId',
  })
  declare toolInstances: HasMany<typeof EduToolInstance>

  @hasMany(() => EduToolAccess, {
    foreignKey: 'schoolId',
  })
  declare toolAccesses: HasMany<typeof EduToolAccess>
}
