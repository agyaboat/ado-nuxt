import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fee_student_ledgers'

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
        .uuid('fee_schedule_id')
        .notNullable()
        .references('id')
        .inTable('fee_schedules')
        .onDelete('RESTRICT')
        .index()

      table
        .uuid('academic_period_id')
        .notNullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('RESTRICT')
        .index()

      table
        .uuid('class_id')
        .notNullable()
        .references('id')
        .inTable('school_classes')
        .onDelete('RESTRICT')
        .index()

      table.string('accommodation_type', 50).notNullable()

      table.integer('amount').notNullable()

      table.integer('amount_paid').notNullable().defaultTo(0)

      table.string('payment_status', 50).nullable()

      table.json('breakdown').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['student_id', 'academic_period_id'], {
        indexName: 'uq_fees_manager-fsl-student-apid',
      })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
