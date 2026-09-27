import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const recordPaymentValidator = vine.create({
  studentId: vine.string().uuid(),

  amount: vine.number().min(1),

  paymentMethod: vine.enum(['cash', 'bank_transfer', 'cheque', 'mobile_money', 'other']),

  paidAt: vine.date({ formats: ['iso8601'] }).transform((value) => DateTime.fromJSDate(value)),

  reference: vine.string().trim().maxLength(100).nullable().optional(),

  notes: vine.string().trim().nullable().optional(),

  meta: vine.object({
    paidBy: vine.object({
      name: vine.string().trim().minLength(1),

      phone: vine.string().trim().nullable().optional(),

      email: vine.string().trim().email().nullable().optional(),
    }),
  }),
})

export const getPaymentsValidator = vine.create({
  page: vine.number().min(1).optional(),
  limit: vine.number().min(1).max(100).optional(),

  search: vine.string().trim().maxLength(100).optional().nullable(),

  academicPeriodId: vine.string().uuid().optional().nullable(),

  classId: vine.string().uuid().optional().nullable(),

  mode: vine.enum(['manual', 'online']).optional().nullable(),

  date: vine
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
})

export const paymentAllocationParamsValidator = vine.create({
  params: vine.object({
    paymentId: vine.string().uuid(),
  }),
})
