import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuid } from 'uuid'

import { FeePaymentRecordSchema } from '#database/schema'
import School from '#models/school'
import SchoolStudent from '#models/school_student'
// import FeeStudentLedger from '#models/fee_student_ledger'
import FeeTransaction from '#models/fee_transaction'
import SchoolStaff from '#models/school_staff'
import FeePaymentAllocation from './fee_payment_allocation.ts'

export default class FeePaymentRecord extends FeePaymentRecordSchema {
  @beforeCreate()
  public static assignDefaults(item: FeePaymentRecord) {
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

  // @belongsTo(() => FeeStudentLedger, {
  //   foreignKey: 'feeStudentLedgerId',
  // })
  // declare feeStudentLedger: BelongsTo<typeof FeeStudentLedger>

  @belongsTo(() => FeeTransaction, {
    foreignKey: 'feeTransactionId',
  })
  declare feeTransaction: BelongsTo<typeof FeeTransaction>

  @belongsTo(() => SchoolStaff, {
    foreignKey: 'recordedByStaffId',
  })
  declare recordedByStaff: BelongsTo<typeof SchoolStaff>

  @hasMany(() => FeePaymentAllocation, {
    foreignKey: 'feePaymentRecordId',
  })
  declare paymentAllocations: HasMany<typeof FeePaymentAllocation>
}
