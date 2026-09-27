import type FeeSchedule from '#models/fee_schedule'

export default class FeeScheduleSerializer {
  static serialize(feeSchedule: FeeSchedule) {
    return {
      id: feeSchedule.id,
      class: {
        id: feeSchedule.class?.id ?? null,
        label: feeSchedule.class?.label ?? null,
      },
      accommodationType: feeSchedule.accommodationType,
      academicPeriod: {
        id: feeSchedule.academicPeriod?.id ?? null,
        label: feeSchedule.academicPeriod?.label ?? null,
        year: {
          id: feeSchedule.academicPeriod?.academicYear?.id ?? null,
          label: feeSchedule.academicPeriod?.academicYear?.label ?? null,
        },
      },
      amount: feeSchedule.amount,
      breakdown: feeSchedule.breakdown,
      status: feeSchedule.status,
      meta: {
        lastAppliedAt: feeSchedule.meta?.lastAppliedAt,
      },
      updateAt: feeSchedule.updatedAt,
    }
  }

  static serializeMany(feeSchedules: FeeSchedule[]) {
    return feeSchedules.map((feeSchedule) => this.serialize(feeSchedule))
  }
}
