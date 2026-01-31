import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import { v4 as uuid } from 'uuid'

export default class Log extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  /**
   * Polymorphic context
   * What entity this log is about
   */
  @column()
  declare loggableType: 'user' | 'voter' | 'election' | 'event' | 'admin' | 'internal'

  @column()
  declare loggableId: string | null

  /**
   * Actor (nullable for system/internal logs)
   */
  @column()
  declare userId: string | null

  /**
   * Human-readable action
   * e.g. "event payout approved", "credit balance adjusted"
   */
  @column()
  declare action: string

  /**
   * Arbitrary structured context
   * JSON-searchable in MySQL
   */
  @column()
  declare meta: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static assignDefaults(logs: Log) {
    if (!logs.id) {
      logs.id = uuid()
    }
  }

  /* ───────────── Relations ───────────── */

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
