import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fee_schedules'

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
        .uuid('class_id')
        .notNullable()
        .references('id')
        .inTable('school_classes')
        .onDelete('CASCADE')
        .index()

      table
        .uuid('academic_period_id')
        .notNullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('CASCADE')
        .index()

      table.string('accommodation_type', 50).notNullable()

      table.integer('amount').notNullable()

      table.json('breakdown').nullable()

      table.string('status', 50).notNullable().defaultTo('active').index()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['school_id', 'academic_period_id', 'class_id', 'accommodation_type'], {
        indexName: 'uq_fees_manager-fs-sid-apid-cid-at',
      })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
