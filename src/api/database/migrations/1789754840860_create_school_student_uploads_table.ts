import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_student_uploads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE')

      table
        .uuid('class_id')
        .notNullable()
        .references('id')
        .inTable('school_classes')
        .onDelete('CASCADE')

      table.uuid('user_id').nullable().references('user_id').inTable('users').onDelete('SET NULL')

      table.integer('total_students').unsigned().notNullable()

      table.string('status', 30).notNullable().defaultTo('running')

      table.text('error_message').nullable()

      table.timestamp('completed_at').nullable()

      table.timestamp('failed_at').nullable()

      table.timestamp('revertible_until').nullable()

      table.timestamps()

      table.index(['school_id', 'status'], 'school_student_uploads_school_status_index')

      table.index(['created_at'], 'school_student_uploads_created_at_index')

      table.index(['revertible_until'], 'school_student_uploads_revertible_until_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
