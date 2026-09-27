import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_students'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /**
       * Operational pointer to the student's current enrollment.
       *
       * The enrollment record contains the authoritative academic
       * placement, including school, academic year, academic period,
       * class, and enrollment status.
       *
       * This pointer exists for fast operational access and should
       * never be treated as a replacement for enrollment history.
       */
      table
        .uuid('current_enrollment_id')
        .nullable()
        .references('id')
        .inTable('student_class_enrollments')
        .onDelete('SET NULL')
        .index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('current_enrollment_id')
    })
  }
}
