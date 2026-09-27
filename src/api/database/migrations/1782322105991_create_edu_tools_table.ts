import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'edu_tools'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /**
       * Stable frontend/backend identity.
       *
       * Examples:
       * - fees_manager
       * - class_manager
       * - attendance
       */
      table.string('key', 100).notNullable().unique()

      /**
       * Human display label.
       */
      table.string('label').notNullable()

      table.json('image').nullable()

      table.text('description').nullable()

      /**
       * Generic tool type.
       *
       * Suites are modeled separately from EduTool.
       */
      table.string('type', 50).notNullable().defaultTo('tool').index()

      /**
       * Organizational/discovery category.
       *
       * Examples:
       * - finance
       * - academic
       * - communication
       * - operations
       */
      table.string('category', 50).nullable().index()

      /**
       * Tool lifecycle state.
       *
       * active      = usable
       * inactive    = temporarily unavailable
       * deprecated  = being phased out
       * archived    = retained as legacy metadata
       */
      table.string('status', 50).notNullable().defaultTo('active').index()

      /**
       * Controls whether the tool is exposed in
       * the public/internal tool market.
       */
      table.boolean('is_market_visible').notNullable().defaultTo(true).index()
      table.boolean('is_featured').notNullable().defaultTo(false).index()

      /**
       * Default commercial pricing for the tool.
       *
       * These are the tool's standard/public prices.
       * School-specific pricing belongs to EduToolInstance.
       *
       * Amounts are stored in the smallest currency unit.
       */
      table.integer('standard_price_per_month').notNullable().defaultTo(0)
      table.integer('pro_price_per_month').nullable()
      table.boolean('pro_available').notNullable().defaultTo(false)

      /**
       * UI listing order in market/admin surfaces.
       */
      table.integer('sort_order').nullable().index()

      /**
       * Default configuration used when provisioning
       * an EduToolInstance.
       */
      table.json('default_config').nullable()

      table.json('meta').nullable()

      table
        .uuid('created_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
