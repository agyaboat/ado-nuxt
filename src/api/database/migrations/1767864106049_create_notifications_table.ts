import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /**
       * Targeting
       */
      table.string('notifiable_group').nullable().comment('who should receive this notification')

      table
        .uuid('user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .comment('only required when notifiable_group = user')

      /**
       * Context
       */
      table.string('notifiable_type').nullable()

      table.uuid('notifiable_id').nullable()

      /**
       * Content
       */
      table.string('title').notNullable()
      table.text('message').notNullable()
      table.json('meta').nullable()

      /**
       * Lifecycle
       */

      table.timestamp('read_at').nullable()
      table.timestamp('expires_at').nullable()

      table.enum('priority', ['low', 'normal', 'high']).notNullable().defaultTo('normal')

      table.timestamps(true)

      table.index(['notifiable_group'])
      table.index(['user_id', 'read_at'])
      table.index(['notifiable_type', 'notifiable_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
