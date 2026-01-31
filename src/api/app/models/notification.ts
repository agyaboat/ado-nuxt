import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import { v4 as uuid } from 'uuid'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare notifiableGroup: 'general' | 'user' | 'users' | 'admins' | 'marketers'

  @column()
  declare userId?: string | null

  @column()
  declare notifiableType: 'general' | 'wallet' | 'election' | 'event' | 'payout' | 'credit'

  @column()
  declare notifiableId: string | null

  @column()
  declare title: string

  @column()
  declare message: string

  @column()
  declare meta: Record<string, any> | null

  /**
   * Controls read/unread state
   */
  @column.dateTime()
  declare readAt?: DateTime | null

  @column.dateTime()
  declare expiresAt?: DateTime | null

  @column()
  declare priority: 'low' | 'normal' | 'high'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* ───────── Relations ───────── */

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  public static assignDefaults(notification: Notification) {
    if (!notification.id) {
      notification.id = uuid()
    }
    if (!notification.expiresAt) {
      notification.expiresAt = DateTime.now().plus({ days: 30 })
    }
  }
}
