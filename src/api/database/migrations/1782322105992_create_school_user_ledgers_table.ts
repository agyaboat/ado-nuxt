import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_user_ledgers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      /**
       * Durable identifier for this school-user relationship.
       *
       * This ID is referenced by other Core domains, such as
       * EduToolAccess.
       */
      table.uuid('id').primary()

      /**
       * School in which the global User has a school-specific identity.
       */
      table
        .uuid('school_id')
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
        .index()

      /**
       * Global ScholarSaaS account associated with this school identity.
       *
       * A User may have multiple ledger records across different schools.
       */
      table
        .uuid('user_id')
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()

      /**
       * School-domain account represented by this ledger.
       *
       * Current supported values:
       * - staff
       * - guardian
       *
       * This determines the domain represented by type_id.
       */
      table.string('account_type', 50).notNullable().index()

      /**
       * ID of the school-domain record represented by this ledger.
       *
       * Examples:
       * - account_type = staff    → school_staffs.id
       * - account_type = guardian → school_guardians.id
       *
       * This is a polymorphic reference and is therefore validated
       * at the application/Core level rather than through a database FK.
       */
      table.uuid('type_id').notNullable().index()

      /**
       * Method through which the school-domain record was linked
       * to the global User account.
       *
       * Examples may include username, phone, email, invitation,
       * admin_link, import, or other supported mechanisms.
       */
      table.string('link_method', 50).nullable()

      /**
       * Identifier/value used when the link was established.
       *
       * Useful for recording the provenance of the relationship,
       * such as the username, phone number, or email supplied
       * during linking.
       */
      table.string('link_value').nullable()

      /**
       * Lifecycle state of the school-user relationship.
       *
       * This describes the ledger relationship itself, not the
       * User account and not access to individual tools.
       */
      table.string('status', 50).notNullable().defaultTo('active').index()

      /**
       * When the school-user relationship became active.
       */
      table.timestamp('linked_at').nullable()

      /**
       * When the school-user relationship was ended.
       *
       * The ledger record is retained so historical relationships
       * remain traceable.
       */
      table.timestamp('unlinked_at').nullable()

      /**
       * Additional non-core metadata associated with the relationship.
       */
      table.json('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      /**
       * A school-domain person can have only one active ledger
       * identity of the same account type within a school.
       *
       * This prevents duplicate links such as the same
       * SchoolStaff being represented by multiple ledger records
       * in the same school.
       */
      table.unique(['school_id', 'account_type', 'type_id'], {
        indexName: 'sch_user_ledgers_acc_type_unique',
      })

      /**
       * Supports school-level queries for ledger identities
       * by account type and lifecycle state.
       */
      table.index(['school_id', 'account_type', 'status'], 'sch_user_ledgers_sch_type_status_index')

      /**
       * Supports finding a User's school relationships and
       * determining their current relationship state.
       */
      table.index(
        ['user_id', 'school_id', 'status'],
        'school_user_ledgers_user_school_status_index'
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
