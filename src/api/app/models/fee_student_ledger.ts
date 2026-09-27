import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuid } from 'uuid'

import { FeeStudentLedgerSchema } from '#database/schema'
import School from '#models/school'
import SchoolStudent from '#models/school_student'
import FeeSchedule from '#models/fee_schedule'
import AcademicPeriod from '#models/academic_period'
import SchoolClass from '#models/school_class'
import FeePaymentRecord from '#models/fee_payment_record'

export default class FeeStudentLedger extends FeeStudentLedgerSchema {
  @beforeCreate()
  public static assignDefaults(item: FeeStudentLedger) {
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

  @belongsTo(() => FeeSchedule, {
    foreignKey: 'feeScheduleId',
  })
  declare feeSchedule: BelongsTo<typeof FeeSchedule>

  @belongsTo(() => AcademicPeriod, {
    foreignKey: 'academicPeriodId',
  })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @belongsTo(() => SchoolClass, {
    foreignKey: 'classId',
  })
  declare class: BelongsTo<typeof SchoolClass>

  @hasMany(() => FeePaymentRecord, {
    foreignKey: 'feeStudentLedgerId',
  })
  declare paymentRecords: HasMany<typeof FeePaymentRecord>
}
