import { FeeStudentOldArrearSettlementSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuid } from 'uuid'

import FeePaymentRecord from './fee_payment_record.ts'
import FeeStudentOldArrear from './fee_student_old_arrear.ts'

export default class FeeStudentOldArrearSettlement extends FeeStudentOldArrearSettlementSchema {
  @beforeCreate()
  public static assignDefaults(item: FeeStudentOldArrearSettlement) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => FeeStudentOldArrear, {
    foreignKey: 'feeStudentOldArrearId',
  })
  declare oldArrear: BelongsTo<typeof FeeStudentOldArrear>

  @belongsTo(() => FeePaymentRecord, {
    foreignKey: 'feePaymentRecordId',
  })
  declare paymentRecord: BelongsTo<typeof FeePaymentRecord>
}
