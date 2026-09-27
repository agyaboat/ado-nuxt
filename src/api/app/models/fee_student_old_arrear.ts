import { FeeStudentOldArrearSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuid } from 'uuid'

import School from './school.ts'
import SchoolStudent from './school_student.ts'
import FeeStudentOldArrearSettlement from './fee_student_old_arrear_settlement.ts'

export default class FeeStudentOldArrear extends FeeStudentOldArrearSchema {
  @beforeCreate()
  public static assignDefaults(item: FeeStudentOldArrear) {
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

  @hasMany(() => FeeStudentOldArrearSettlement, {
    foreignKey: 'feeStudentOldArrearId',
  })
  declare settlements: HasMany<typeof FeeStudentOldArrearSettlement>
}
