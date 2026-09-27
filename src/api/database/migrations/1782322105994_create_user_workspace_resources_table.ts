import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_workspace_resources'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table
        .uuid('user_id')
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()

      table
        .uuid('school_id')
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
        .index()

      table.string('label').notNullable()
      table.string('sublabel').nullable()
      table.text('description').nullable()
      table.json('image').nullable()

      table.string('resource_type', 50).notNullable().index()
      table.uuid('resource_id').notNullable().index()

      table.integer('sort_order').nullable().index()

      table.json('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['user_id', 'school_id', 'resource_type', 'resource_id'])

      table.index(['user_id', 'school_id'], 'user_workspace_resources_user_school_index')

      table.index(
        ['school_id', 'resource_type', 'resource_id'],
        'user_workspace_resources_school_resource_index'
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
