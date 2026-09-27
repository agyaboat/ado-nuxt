import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'academic_periods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table
        .uuid('school_id')
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
        .index()

      table
        .uuid('academic_year_id')
        .notNullable()
        .references('id')
        .inTable('academic_years')
        .onDelete('CASCADE')
        .index()

      /**
       * Display label chosen by the school.
       *
       * Examples:
       * - Term 1
       * - First Term
       * - Semester 1
       * - January-April Period
       */
      table.string('label').notNullable()

      /**
       * Used to order periods inside the academic year.
       *
       * Example:
       * Term 1 => 1
       * Term 2 => 2
       * Term 3 => 3
       */
      table.integer('sort_order').notNullable().defaultTo(1)

      /**
       * Period dates are required because tools like fees,
       * attendance, assessments, and reports depend on actual period boundaries.
       */
      table.date('starts_at').notNullable()
      table.date('ends_at').notNullable()

      table.string('status').notNullable().defaultTo('draft').index()

      table.json('meta').nullable()

      table
        .uuid('created_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      table
        .uuid('created_by_staff_id')
        .nullable()
        .references('id')
        .inTable('school_staffs')
        .onDelete('SET NULL')
        .index()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['school_id', 'academic_year_id', 'label'])
      table.unique(['school_id', 'academic_year_id', 'sort_order'])

      table.index(['school_id', 'status'])
      table.index(['academic_year_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
