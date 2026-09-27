import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'academic_years'

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

      table.string('label').notNullable()

      table.string('period_scheme', 50).notNullable()

      table.date('starts_at').nullable()
      table.date('ends_at').nullable()

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

      table.unique(['school_id', 'label'])
      table.index(['school_id', 'status'])
      table.index(['school_id', 'period_scheme'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
