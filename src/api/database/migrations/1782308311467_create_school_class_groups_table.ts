import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_class_groups'

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

      /**
       * Display label chosen by the school.
       *
       * Examples:
       * - Pre-School
       * - Lower Primary
       * - Upper Primary
       * - JHS
       */
      table.string('label').notNullable()

      /**
       * Stable school-scoped identifier.
       *
       * Examples:
       * - PRE_SCHOOL
       * - LOWER_PRIMARY
       * - UPPER_PRIMARY
       * - JHS
       */
      table.string('code', 50).notNullable()

      /**
       * Used to order groups within the school.
       */
      table.integer('sort_order').notNullable().defaultTo(1)

      table.string('status').notNullable().defaultTo('active')

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

      table.unique(['school_id', 'label'])
      table.unique(['school_id', 'code'])
      table.unique(['school_id', 'sort_order'])

      table.index(['school_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
