import type SchoolClass from '#models/school_class'

export default class SchoolClassSerializer {
  static serialize(schoolClass: SchoolClass) {
    return {
      id: schoolClass.id,
      label: schoolClass.label,
      sortOrder: schoolClass.sortOrder,
      parentId: schoolClass.parentId,
      status: schoolClass.status,
      studentCount: schoolClass.$extras.enrollments_count ?? 0,
      variants:
        schoolClass.variants?.map((variant) => ({
          id: variant.id,
          label: variant.label,
          sortOrder: variant.sortOrder,
          parentId: variant.parentId,
          status: variant.status,
          studentCount: variant.$extras.enrollments_count ?? 0,
          variants: null,
        })) ?? null,
    }
  }

  static serializeMany(classes: SchoolClass[]) {
    return classes.map((schoolClass) => this.serialize(schoolClass))
  }
}
