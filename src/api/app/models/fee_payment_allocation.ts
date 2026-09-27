import { FeePaymentAllocationSchema } from '#database/schema'
import { v4 as uuid } from 'uuid'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import FeePaymentRecord from './fee_payment_record.ts'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import FeeStudentLedger from './fee_student_ledger.ts'

export default class FeePaymentAllocation extends FeePaymentAllocationSchema {
  @beforeCreate()
  public static assignDefaults(item: FeePaymentAllocation) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => FeePaymentRecord, {
    foreignKey: 'feePaymentRecordId',
  })
  declare paymentRecord: BelongsTo<typeof FeePaymentRecord>

  @belongsTo(() => FeeStudentLedger, {
    foreignKey: 'feeStudentLedgerId',
  })
  declare feeStudentLedger: BelongsTo<typeof FeeStudentLedger>
}
