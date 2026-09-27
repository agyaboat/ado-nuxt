import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { beforeCreate, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { v4 as uuidv4 } from 'uuid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import { UserSchema } from '#database/schema'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export const PLACEHOLDER_EMAIL_PREFIX = '_placeholder__'

export default class User extends compose(UserSchema, AuthFinder) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  currentAccessToken?: AccessToken

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: 'user' | 'admin' | 'super'

  @column()
  declare status: 'active' | 'pending' | 'inactive' | 'banned'

  @beforeCreate()
  static setUuid(user: User) {
    user.userId = uuidv4()

    if (!user.email) {
      user.email = `${PLACEHOLDER_EMAIL_PREFIX}${user.userId}`
    }
  }
}
