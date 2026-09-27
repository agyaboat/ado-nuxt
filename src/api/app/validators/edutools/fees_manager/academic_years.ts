import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const createAcademicYearValidator = vine.create({
  label: vine
    .string()
    .trim()
    .regex(/^\d{4}\/\d{4}$/),

  periodScheme: vine.enum(['semester', 'trimester']),

  startsAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),

  endsAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),
})

export const updateAcademicYearValidator = vine.create({
  startsAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),

  endsAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),
})

export const createAcademicPeriodValidator = vine.create({
  label: vine.string().trim().minLength(1).maxLength(255),

  sortOrder: vine.number().min(1).max(3),

  startsAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),

  endsAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),

  params: vine.object({
    academicYearId: vine.string().uuid(),
  }),
})

export const setCurrentPeriodValidator = vine.create({
  periodId: vine.string().uuid(),
})

export const deleteAcademicPeriodValidator = vine.create({
  params: vine.object({
    academicPeriodId: vine.string().uuid(),
  }),
})

export const academicYearParamsValidator = vine.create({
  params: vine.object({
    academicYearId: vine.string().uuid(),
  }),
})

export const updateAcademicPeriodValidator = vine.create({
  label: vine.string().trim().minLength(1).maxLength(255),

  // sortOrder: vine.number().min(1).max(3),

  startsAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),

  endsAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),

  params: vine.object({
    academicPeriodId: vine.string().uuid(),
  }),
})
