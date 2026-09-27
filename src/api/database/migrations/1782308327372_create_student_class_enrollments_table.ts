import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_class_enrollments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      //this will be used for all records operations: for core, and tools
      /**
       * Stable identifier for the student's official class placement.
       *
       * Core owns this record. Downstream tools may reference this
       * enrollment through Core contracts but must not maintain a
       * competing enrollment record.
       */
      table.uuid('id').primary()

      table
        .uuid('school_id')
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
        .index()

      table
        .uuid('student_id')
        .notNullable()
        .references('id')
        .inTable('school_students')
        .onDelete('CASCADE')
        .index()

      table
        .uuid('class_id')
        .notNullable()
        .references('id')
        .inTable('school_classes')
        .onDelete('RESTRICT')
        .index()

      table
        .uuid('academic_year_id')
        .notNullable()
        .references('id')
        .inTable('academic_years')
        .onDelete('RESTRICT')
        .index()

      /**
       * Useful for tracking promotion history.
       *
       * Example:
       * Class 6 -> Class 7 Gold
       */
      table
        .uuid('promoted_from_class_id')
        .nullable()
        .references('id')
        .inTable('school_classes')
        .onDelete('SET NULL')
        .index()

      // table
      //   .enu('status', [
      //     'active',
      //     'promoted',
      //     'repeated',
      //     'transferred',
      //     'withdrawn',
      //     'completed',
      //     'cancelled',
      //   ])
      table.string('status').notNullable().defaultTo('active').index()

      table.date('enrolled_at').nullable()
      table.date('promoted_at').nullable()

      table.json('meta').nullable()

      table
        .uuid('added_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      table
        .uuid('added_by_staff_id')
        .nullable()
        .references('id')
        .inTable('school_staffs')
        .onDelete('SET NULL')
        .index()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      /**
       * One official class placement per student per academic year.
       */
      table.unique(['school_id', 'student_id', 'academic_year_id'])

      table.index(['school_id', 'class_id'])
      table.index(['school_id', 'class_id', 'academic_year_id'])
      table.index(['school_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
