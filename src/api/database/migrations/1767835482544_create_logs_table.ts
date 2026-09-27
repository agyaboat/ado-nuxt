import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.string('loggable_type', 50).nullable()
      table.uuid('loggable_id').nullable()

      table.uuid('user_id').nullable().references('user_id').inTable('users').onDelete('SET NULL')

      table.text('action').notNullable()

      table.json('meta').nullable()

      table.timestamp('created_at').notNullable()

      table.index(['loggable_type', 'loggable_id'])
      table.index(['user_id'])
      table.index(['action'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
