import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fee_student_old_arrear_settlements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table
        .uuid('fee_student_old_arrear_id')
        .notNullable()
        .references('id')
        .inTable('fee_student_old_arrears')
        .onDelete('RESTRICT')

      table
        .uuid('fee_payment_record_id')
        .notNullable()
        .references('id')
        .inTable('fee_payment_records')
        .onDelete('RESTRICT')

      /**
       * Amount settled from the payment toward the
       * old-arrears obligation, in minor currency units.
       */
      table.integer('amount').unsigned().notNullable()

      table.timestamp('settled_at').notNullable()

      table.timestamp('created_at').notNullable()

      table.timestamp('updated_at').notNullable()

      table.index(['fee_student_old_arrear_id'], 'fee_old_arrear_settlements_arrear_id_index')

      table.index(['fee_payment_record_id'], 'fee_old_arrear_settlements_payment_id_index')

      table.index(['settled_at'], 'fee_old_arrear_settlements_settled_at_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
