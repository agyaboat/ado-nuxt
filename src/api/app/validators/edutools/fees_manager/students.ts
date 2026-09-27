import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const indexStudentsValidator = vine.create({
  page: vine.number().min(1).optional(),
  limit: vine.number().min(1).max(100).optional(),
  search: vine.string().trim().maxLength(100).optional(),
  classId: vine.string().uuid().nullable().optional(),
  accommodation: vine.string().trim().maxLength(50).optional(),
  status: vine.string().trim().maxLength(50).optional(),
})

export const createStudentValidator = vine.create({
  firstName: vine.string().trim().minLength(1).maxLength(100),
  middleName: vine.string().trim().maxLength(100).nullable().optional(),
  lastName: vine.string().trim().minLength(1).maxLength(100),
  gender: vine.string().trim().maxLength(50).nullable().optional(),
  dateOfBirth: vine
    .date({ formats: ['iso8601'] })
    .transform((v) => DateTime.fromJSDate(v))
    .nullable()
    .optional(),
  phone: vine.string().trim().maxLength(30).nullable().optional(),
  email: vine.string().trim().email().maxLength(255).nullable().optional(),
  studentStatus: vine.string().maxLength(30).nullable().optional(),
  address: vine.string().trim().maxLength(500).nullable().optional(),
  nationality: vine.string().trim().maxLength(100).nullable().optional(),
  residentialStatus: vine.string().trim().maxLength(50).nullable().optional(),
  admissionNumber: vine.string().trim().maxLength(100).nullable().optional(),
  classId: vine.string().uuid(),
  arrearsAmount: vine.number().min(0).optional(),
  arrearsNote: vine.string().trim().maxLength(1000).nullable().optional(),
})

export const studentParamsValidator = vine.create({
  params: vine.object({
    studentId: vine.string().uuid(),
  }),
})

export const importStudentsValidator = vine.create({
  classId: vine.string().uuid(),

  students: vine
    .array(
      vine.object({
        firstName: vine.string().trim().minLength(1).maxLength(100),
        middleName: vine.string().trim().maxLength(100).nullable().optional(),
        lastName: vine.string().trim().minLength(1).maxLength(100),
        admissionNumber: vine.string().trim().minLength(1).maxLength(100),
        gender: vine.string().trim().maxLength(50).nullable().optional(),
        residentialStatus: vine.string().trim().minLength(1).maxLength(50),
        arrearsAmount: vine.number().min(0).optional(),
        arrearsNote: vine.string().trim().maxLength(1000).nullable().optional(),
      })
    )
    .minLength(1)
    .maxLength(100),
})
