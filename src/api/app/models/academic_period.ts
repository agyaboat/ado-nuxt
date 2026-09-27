import { AcademicPeriodSchema } from '#database/schema'

import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import AcademicYear from '#models/academic_year'
import School from '#models/school'
import SchoolStaff from '#models/school_staff'
import User from '#models/user'

import { v4 as uuid } from 'uuid'

export default class AcademicPeriod extends AcademicPeriodSchema {
  @beforeCreate()
  public static assignDefaults(item: AcademicPeriod) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => AcademicYear, {
    foreignKey: 'academicYearId',
  })
  declare academicYear: BelongsTo<typeof AcademicYear>

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
}
