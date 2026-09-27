import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tool_instance_profit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /**
       * The specific school provision of the tool that generated
       * this financial record.
       */
      table
        .uuid('edu_tool_instance_id')
        .notNullable()
        .references('id')
        .inTable('edu_tool_instances')
        .onDelete('RESTRICT')
        .index()

      /**
       * Amount earned by ScholarSaaS from this tool instance.
       *
       * Stored in the smallest currency unit.
       */
      table.integer('amount').notNullable()

      /**
       * Currency used for this earning.
       *
       * Kept on the log so historical financial records remain
       * accurate even if the school's currency configuration changes.
       */
      table.string('currency', 10).notNullable().defaultTo('GHS')

      /**
       * Describes the source of the earning.
       *
       * Examples:
       * - subscription
       * - transaction_fee
       * - integration
       * - usage
       * - manual
       */
      table.string('source', 50).notNullable().index()

      /**
       * Optional identifier for the originating transaction,
       * payment, invoice, or tool-specific financial event.
       */
      table.string('reference', 255).nullable().index()

      /**
       * When the earning actually occurred.
       */
      table.timestamp('occurred_at').notNullable().index()

      /**
       * Tool-specific financial context.
       */
      table.json('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
