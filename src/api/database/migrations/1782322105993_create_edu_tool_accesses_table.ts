import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'edu_tool_accesses'

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
      /**
       * School-scoped identity.
       *
       * This is the person in the context of a particular school.
       */
      table
        .uuid('school_user_ledger_id')
        .notNullable()
        .references('id')
        .inTable('school_user_ledgers')
        .onDelete('CASCADE')
        .index()

      /**
       * The provisioned tool instance this user can access.
       */
      table
        .uuid('edu_tool_instance_id')
        .notNullable()
        .references('id')
        .inTable('edu_tool_instances')
        .onDelete('CASCADE')
        .index()

      /**
       * Access lifecycle.
       */
      table.string('status', 50).notNullable().defaultTo('active').index()

      table.timestamp('granted_at').nullable()
      table.timestamp('revoked_at').nullable()

      /**
       * meta: {
            label?: string
            sublabel?: string
            // other access-specific metadata
          }
       */
      table.json('meta').nullable()

      table
        .uuid('granted_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['school_user_ledger_id', 'edu_tool_instance_id'])

      table.index(['school_user_ledger_id', 'status'])

      table.index(['edu_tool_instance_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
