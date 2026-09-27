import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fee_payment_records'

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

      table
        .uuid('fee_transaction_id')
        .nullable()
        .references('id')
        .inTable('fee_transactions')
        .onDelete('RESTRICT')
        .index()

      table
        .uuid('recorded_by_staff_id')
        .nullable()
        .references('id')
        .inTable('school_staffs')
        .onDelete('SET NULL')
        .index()

      table
        .uuid('recorded_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      table.string('mode', 20).notNullable()

      table.integer('amount').notNullable()

      table.string('payment_method', 50).nullable()

      table.string('reference', 100).nullable().index()

      table.timestamp('paid_at').notNullable()
      table.timestamp('allocation_completed_at').nullable()

      table.text('notes').nullable()

      table.json('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
