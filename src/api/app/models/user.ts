import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { v4 as uuidv4 } from 'uuid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import { UserSchema } from '#database/schema'

import AcademicPeriod from './academic_period.ts'
import AcademicYear from './academic_year.ts'
import BillingPayment from './billing_payment.ts'
import EduToolAccess from './edu_tool_access.ts'
import EduToolInstance from './edu_tool_instance.ts'
import School from './school.ts'
import SchoolGuardian from './school_guardian.ts'
import SchoolStaff from './school_staff.ts'
import SchoolStudent from './school_student.ts'
import SchoolUserLedger from './school_user_ledger.ts'
import StudentClassEnrollment from './student_class_enrollment.ts'
import StudentGuardian from './student_guardian.ts'
import UserWorkspaceResource from './user_workspace_resource.ts'

import type { HasMany } from '@adonisjs/lucid/types/relations'

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

  @hasMany(() => UserWorkspaceResource, {
    foreignKey: 'userId',
    localKey: 'userId',
  })
  declare workspaceResources: HasMany<typeof UserWorkspaceResource>

  @hasMany(() => SchoolUserLedger, {
    foreignKey: 'userId',
    localKey: 'userId',
  })
  declare schoolUserLedgers: HasMany<typeof SchoolUserLedger>

  @hasMany(() => School, {
    foreignKey: 'ownerId',
    localKey: 'userId',
  })
  declare ownedSchools: HasMany<typeof School>

  @hasMany(() => School, {
    foreignKey: 'createdByUserId',
    localKey: 'userId',
  })
  declare createdSchools: HasMany<typeof School>

  @hasMany(() => SchoolStaff, {
    foreignKey: 'addedByUserId',
    localKey: 'userId',
  })
  declare addedStaff: HasMany<typeof SchoolStaff>

  @hasMany(() => SchoolStudent, {
    foreignKey: 'addedByUserId',
    localKey: 'userId',
  })
  declare addedStudents: HasMany<typeof SchoolStudent>

  @hasMany(() => SchoolGuardian, {
    foreignKey: 'addedByUserId',
    localKey: 'userId',
  })
  declare addedGuardians: HasMany<typeof SchoolGuardian>

  @hasMany(() => StudentClassEnrollment, {
    foreignKey: 'addedByUserId',
    localKey: 'userId',
  })
  declare addedStudentClassEnrollments: HasMany<typeof StudentClassEnrollment>

  @hasMany(() => StudentGuardian, {
    foreignKey: 'addedByUserId',
    localKey: 'userId',
  })
  declare addedStudentGuardians: HasMany<typeof StudentGuardian>

  @hasMany(() => AcademicYear, {
    foreignKey: 'createdByUserId',
    localKey: 'userId',
  })
  declare createdAcademicYears: HasMany<typeof AcademicYear>

  @hasMany(() => AcademicPeriod, {
    foreignKey: 'createdByUserId',
    localKey: 'userId',
  })
  declare createdAcademicPeriods: HasMany<typeof AcademicPeriod>

  @hasMany(() => EduToolInstance, {
    foreignKey: 'createdByUserId',
    localKey: 'userId',
  })
  declare createdToolInstances: HasMany<typeof EduToolInstance>

  @hasMany(() => EduToolAccess, {
    foreignKey: 'grantedByUserId',
    localKey: 'userId',
  })
  declare grantedToolAccesses: HasMany<typeof EduToolAccess>

  @hasMany(() => EduToolAccess, {
    foreignKey: 'userId',
    localKey: 'userId',
  })
  declare toolAccesses: HasMany<typeof EduToolAccess>

  @hasMany(() => BillingPayment, {
    foreignKey: 'paidByUserId',
    localKey: 'userId',
  })
  declare billingPayments: HasMany<typeof BillingPayment>
}
