import { BillingSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import BillingPayment from '#models/billing_payment'
import User from '#models/user'

import { v4 as uuid } from 'uuid'

export default class Billing extends BillingSchema {
  @beforeCreate()
  public static assignDefaults(item: Billing) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => User, {
    foreignKey: 'payingUserId',
  })
  declare payingUser: BelongsTo<typeof User>

  @hasMany(() => BillingPayment, {
    foreignKey: 'billingId',
  })
  declare payments: HasMany<typeof BillingPayment>
}
