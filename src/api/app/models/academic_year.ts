import { AcademicYearSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import AcademicPeriod from '#models/academic_period'
import School from '#models/school'
import SchoolStaff from '#models/school_staff'
import User from '#models/user'

import { v4 as uuid } from 'uuid'

export default class AcademicYear extends AcademicYearSchema {
  @beforeCreate()
  public static assignDefaults(item: AcademicYear) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolStaff, {
    foreignKey: 'createdByStaffId',
  })
  declare createdByStaff: BelongsTo<typeof SchoolStaff>

  @belongsTo(() => User, {
    foreignKey: 'createdByUserId',
  })
  declare createdByUser: BelongsTo<typeof User>

  @hasMany(() => AcademicPeriod, {
    foreignKey: 'academicYearId',
  })
  declare periods: HasMany<typeof AcademicPeriod>
}
