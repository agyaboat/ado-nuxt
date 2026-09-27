import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'edu_tool_instances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /**
       * Actual school/workspace the tool operates on.
       *
       * Nullable while the instance is being provisioned.
       */
      table
        .uuid('school_id')
        .nullable()
        .references('id')
        .inTable('schools')
        .onDelete('SET NULL')
        .index()

      /**
       * The education tool this instance represents.
       */
      table
        .uuid('edu_tool_id')
        .notNullable()
        .references('id')
        .inTable('edu_tools')
        .onDelete('CASCADE')
        .index()

      /**
       * School-specific instance type.
       *
       * Examples:
       * - standard
       * - pro
       * - enterprise
       */
      table.string('instance_type', 50).notNullable().defaultTo('standard').index()

      /**
       * Actual school-specific monthly cost.
       *
       * This may differ from the default price defined
       * on EduTool because of negotiated/custom pricing.
       *
       * Stored in the smallest currency unit.
       */
      table.integer('cost_per_month').notNullable().defaultTo(0).comment('in subunits of currency')

      /**
       * Instance lifecycle.
       *
       * pending_setup = instance created but setup incomplete
       * active        = usable
       * inactive      = exists but not exposed
       * trialing      = currently in trial
       * paused        = temporarily unavailable
       * cancelled     = cancelled by owner/admin
       * expired       = ended naturally
       * revoked       = forcefully removed
       */
      table.string('status', 50).notNullable().defaultTo('pending_setup').index()

      /**
       * Runtime lifecycle timestamps.
       */
      table.timestamp('activated_at').nullable()
      table.timestamp('deactivated_at').nullable()
      table.timestamp('starts_at').nullable()
      table.timestamp('ends_at').nullable()
      table.timestamp('trial_ends_at').nullable()
      table.timestamp('cancelled_at').nullable()
      table.timestamp('expired_at').nullable()

      /**
       * Tool-specific limits/features.
       *
       * Example:
       * {
       *   student_capacity: 500,
       *   can_link_sms_provider: true
       * }
       */
      table.json('entitlements').nullable()
      table.integer('entitlements_version').notNullable().defaultTo(1)

      /**
       * Tool-specific runtime configuration.
       *
       * Example:
       * {
       *   sms_provider: 'arkesel',
       *   receipt_prefix: 'AMS'
       * }
       */
      table.json('config').nullable()

      /**
       * Flexible setup/runtime metadata.
       */
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

      table.index(['school_id', 'edu_tool_id'])
      table.index(['school_id', 'status'])
      table.index(['edu_tool_id', 'status'])
      table.index(['school_id', 'edu_tool_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
