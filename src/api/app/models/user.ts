import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { v4 as uuidv4 } from 'uuid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string | null

  @column()
  declare middleName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column()
  declare phone: string | null

  @column()
  declare citizenship: string | null

  @column()
  declare nationalIdUrl: string | null
  //for the id system, deny payout if not set up; so that we can track that person

  @column.dateTime()
  declare citizenshipVerifiedAt: DateTime | null

  @column()
  declare avatarPath: string | null

  @column()
  declare dob: DateTime | null

  @column()
  declare role: 'user' | 'admin' | 'super'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare status: 'active' | 'pending' | 'inactive' | 'banned'

  @column.dateTime()
  declare deletedAt: DateTime | null
  //when deleting, just append deleted to the email and set deleted_at to now
  //e.g. user@example.com becomes user@example.com+deleted_at-20240915T153000

  @beforeCreate()
  static setUuid(user: User) {
    user.userId = uuidv4()
  }
}
