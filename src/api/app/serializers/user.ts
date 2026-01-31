// import { DateTime } from 'luxon'
import User from '#models/user'
import env from '#start/env'

export function serializeUser(user: User) {
  return {
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatarPath ? `${env.get('IMG_BASE')}${user.avatarPath}` : null,
    isActive: !!user.emailVerifiedAt,
    citizenship: user.citizenship,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    dob: user.dob?.toISODate() ?? null,
    role: user.role,
    joinedAt: user.createdAt.toJSDate(),
  }
}
