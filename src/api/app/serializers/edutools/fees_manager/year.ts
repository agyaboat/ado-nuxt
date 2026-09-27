import type AcademicYear from '#models/academic_year'

export const serializeYear = (year: AcademicYear) => ({
  id: year.id,
  label: year.label,
  startsAt: year.startsAt,
  endsAt: year.endsAt,
  periodScheme: year.periodScheme,
  periods: year.periods.map((period) => ({
    id: period.id,
    label: period.label,
    startsAt: period.startsAt,
    endsAt: period.endsAt,
    sortOrder: period.sortOrder,
  })),
})
