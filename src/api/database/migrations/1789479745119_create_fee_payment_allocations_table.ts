import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fee_payment_allocations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table
        .uuid('fee_payment_record_id')
        .notNullable()
        .references('id')
        .inTable('fee_payment_records')
        .onDelete('CASCADE')
        .index()

      table
        .uuid('fee_student_ledger_id')
        .notNullable()
        .references('id')
        .inTable('fee_student_ledgers')
        .onDelete('RESTRICT')
        .index()

      table.integer('amount').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['fee_payment_record_id', 'fee_student_ledger_id'], {
        indexName: 'uq_fpa-payment-ledger',
      })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
