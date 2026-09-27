import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fee_transactions'

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
        .uuid('student_id')
        .notNullable()
        .references('id')
        .inTable('school_students')
        .onDelete('CASCADE')
        .index()

      table.string('reference', 100).notNullable().unique()

      table.integer('amount').notNullable()

      table.string('status', 50).notNullable().defaultTo('pending').index()

      table.string('gateway', 50).nullable()

      table.string('provider_reference', 150).nullable().index()

      table.json('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
