import { BillingPaymentSchema } from '#database/schema'

import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Billing from '#models/billing'
import User from '#models/user'

import { v4 as uuid } from 'uuid'

export default class BillingPayment extends BillingPaymentSchema {
  @beforeCreate()
  public static assignDefaults(item: BillingPayment) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => Billing, {
    foreignKey: 'billingId',
  })
  declare billing: BelongsTo<typeof Billing>

  @belongsTo(() => User, {
    foreignKey: 'paidByUserId',
  })
  declare paidByUser: BelongsTo<typeof User>
}
