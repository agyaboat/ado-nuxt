// import { DateTime } from 'luxon'
import type User from '#models/user'
import env from '#start/env'

export function serializeUser(user: User) {
  return {
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: user.profilePicture ? `${env.get('IMG_BASE')}${user.profilePicture}` : null,
    isActive: !!user.emailVerifiedAt,
    citizenship: user.nationalityDetails,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    dob: user.dob?.toISODate() ?? null,
    role: user.role,
    joinedAt: user.createdAt?.toJSDate(),
  }
}

// app/serializers/user_serializer.ts

export function serializeUserV2(user: User) {
  return {
    id: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    username: user.username,
    email: user.email?.endsWith('@placeholder.scholarsaas.com') ? null : user.email,
    phone: user.phone,
    country: user.country,
    profilePicture: user.profilePicture,
    role: user.role,
    passwordSet: user.configs?.passwordSet ?? false,
  }
}
