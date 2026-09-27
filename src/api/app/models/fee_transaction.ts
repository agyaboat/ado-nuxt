import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuid } from 'uuid'

import { FeeTransactionSchema } from '#database/schema'
import School from '#models/school'
import SchoolStudent from '#models/school_student'
import FeePaymentRecord from '#models/fee_payment_record'

export default class FeeTransaction extends FeeTransactionSchema {
  @beforeCreate()
  public static assignDefaults(item: FeeTransaction) {
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

  @hasMany(() => FeePaymentRecord, {
    foreignKey: 'feeTransactionId',
  })
  declare paymentRecords: HasMany<typeof FeePaymentRecord>
}
