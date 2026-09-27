import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'billings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /**
       * What is being billed.
       *
       * billable_type:
       * - suite
       * - tool
       *
       * billable_id:
       * - school_id when type = suite
       * - edu_tool_instance_id when type = tool
       */
      table.string('billable_type', 50).notNullable().index()

      table.uuid('billable_id').notNullable().index()

      /**
       * User responsible for the billing arrangement/payment.
       */
      table
        .uuid('paying_user_id')
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('RESTRICT')
        .index()

      /**
       * Total amount for the current billing period/arrangement.
       *
       * Stored in the smallest currency unit.
       */
      table.integer('total_amount').notNullable().defaultTo(0)

      /**
       * Currency used by this billing record.
       *
       * Stored explicitly so historical billing records remain
       * accurate even if school currency configuration changes.
       */
      table.string('currency', 10).notNullable().defaultTo('GHS')

      /**
       * Snapshot of the calculation/context that produced this bill.
       *
       * This allows future Suite billing to represent things such as:
       * - multiple tools
       * - multiple instances
       * - bundle discounts
       * - quantities
       * - negotiated pricing
       *
       * without requiring Core schema changes.
       */
      table.json('parameters').nullable()

      /**
       * Billing lifecycle.
       *
       * pending   = awaiting payment
       * active    = currently valid
       * cancelled = recurring billing cancelled
       * expired   = billing arrangement ended
       */
      table.string('status', 50).notNullable().defaultTo('pending').index()

      /**
       * Recurring billing lifecycle.
       */
      table.timestamp('started_at').nullable()
      table.timestamp('last_renewed_at').nullable()
      table.timestamp('renews_at').nullable()
      table.timestamp('cancelled_at').nullable()
      table.timestamp('ended_at').nullable()

      /**
       * External/payment-provider reference or other
       * billing-level identifier.
       */

      table.json('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['billable_type', 'billable_id'])
      table.index(['billable_type', 'billable_id', 'status'])
      table.index(['paying_user_id', 'status'])
      table.index(['status', 'renews_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
