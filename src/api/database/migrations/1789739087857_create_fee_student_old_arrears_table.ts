import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fee_student_old_arrears'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')

      table
        .uuid('student_id')
        .notNullable()
        .references('id')
        .inTable('school_students')
        .onDelete('CASCADE')

      /**
       * Stored in minor currency units.
       *
       * Example:
       * GHS 1,200.00 -> 120000
       */
      table.integer('amount').unsigned().notNullable()

      table.text('note').nullable()

      table.timestamp('created_at').notNullable()

      table.timestamp('updated_at').notNullable()

      //track the changes: date, amount, user: name, id;
      //Audit trail for changes to the legacy arrears
      table.json('change_logs').nullable()

      table.unique(['school_id', 'student_id'], {
        indexName: 'fee_old_arrears_school_student_unique',
      })

      table.index(['school_id'], 'fee_old_arrears_school_id_index')

      table.index(['student_id'], 'fee_old_arrears_student_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
