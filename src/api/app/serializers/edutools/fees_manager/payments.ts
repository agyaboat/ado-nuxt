import type FeePaymentAllocation from '#models/fee_payment_allocation'
import type FeePaymentRecord from '#models/fee_payment_record'
import type SchoolClass from '#models/school_class'

export function serializeFeePayment(payment: FeePaymentRecord, schoolClass: SchoolClass | null) {
  return {
    id: payment.id,

    student: {
      id: payment.student.id,
      name: [payment.student.firstName, payment.student.middleName, payment.student.lastName]
        .filter(Boolean)
        .join(' '),
      admissionNumber: payment.student.admissionNumber,
    },

    class: schoolClass
      ? {
          id: schoolClass.id,
          label: schoolClass.label,
        }
      : null,

    amount: payment.amount,
    mode: payment.mode,
    paymentMethod: payment.paymentMethod,
    paidAt: payment.paidAt,
    reference: payment.reference,
  }
}

export function serializeFeePayments(
  payments: FeePaymentRecord[],
  classesById: Map<string, SchoolClass>
) {
  return payments.map((payment) => {
    const ledger = payment.paymentAllocations[0]?.feeStudentLedger
    const schoolClass = ledger ? (classesById.get(ledger.classId) ?? null) : null

    return serializeFeePayment(payment, schoolClass)
  })
}

export function serializePaymentAllocation(allocation: FeePaymentAllocation) {
  const ledger = allocation.feeStudentLedger
  const period = ledger.academicPeriod
  const academicYear = period.academicYear

  return {
    id: allocation.id,
    amount: allocation.amount,
    academicPeriod: {
      id: period.id,
      label: period.label,
      academicYear: {
        id: academicYear.id,
        label: academicYear.label,
      },
    },
  }
}
