import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuid } from 'uuid'

import { FeeScheduleSchema } from '#database/schema'
import School from '#models/school'
import SchoolClass from '#models/school_class'
import AcademicPeriod from '#models/academic_period'
import FeeStudentLedger from '#models/fee_student_ledger'

export default class FeeSchedule extends FeeScheduleSchema {
  @beforeCreate()
  public static assignDefaults(item: FeeSchedule) {
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
  declare class: BelongsTo<typeof SchoolClass>

  @belongsTo(() => AcademicPeriod, {
    foreignKey: 'academicPeriodId',
  })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => FeeStudentLedger, {
    foreignKey: 'feeScheduleId',
  })
  declare studentLedgers: HasMany<typeof FeeStudentLedger>
}
