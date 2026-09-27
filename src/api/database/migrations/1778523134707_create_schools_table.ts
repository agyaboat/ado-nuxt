import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schools'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('owner_id').references('user_id').inTable('users').nullable().onDelete('SET NULL')

      /**
       * Core identity
       */
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()

      /**
       * School code for linking school accounts.
       *
       * MVP rule: 5 uppercase alpha characters, e.g. COHWB, KADEN.
       * DB allows up to 10 chars for future expansion.
       */
      table.string('code', 10).notNullable().unique()

      table.string('type').nullable().index()

      // .enu('ownership', ['public', 'private', 'mission', 'government', 'ngo', 'other'])
      table.string('ownership_type').nullable()

      /**
       * Location
       */
      table.string('country_code', 5).nullable().index()

      table.json('venue_details').nullable()

      /**
       * Contact
       */
      table.string('phone').nullable()
      table.json('other_phones').nullable()
      table.string('email').nullable()
      table.string('website').nullable()

      /**
       * Branding
       */
      table.json('logo_image').nullable()
      table.json('banner_image').nullable()

      /**
       * Localization
       */
      table.string('timezone').notNullable().defaultTo('Africa/Accra')
      table.string('currency', 10).notNullable().defaultTo('GHS')
      table.string('locale', 20).notNullable().defaultTo('en-GH')

      /**
       * Lifecycle status.
       *
       * onboarding = school boundary exists but setup is incomplete
       * active     = school can operate normally
       * suspended  = access is restricted
       * archived   = school is no longer active but data is retained
       */
      table.string('status').notNullable().defaultTo('onboarding').index()

      /**
       * How the school boundary was originally created.
       *
       * manual   = created through normal school onboarding
       * auto     = auto-created for modular tools/workspaces
       * imported = created through bulk import
       * migrated = created from an older external/internal system
       *
       * Note:
       * If an auto-created placeholder later upgrades into the full school suite,
       * keep provisioning_type as 'auto' and set is_placeholder to false.
       */
      // .enu('provisioning_type', ['manual', 'auto', 'imported', 'migrated'])
      table.string('provisioning_type').notNullable().defaultTo('manual').index()

      /**
       * Whether this school boundary is still a lightweight placeholder.
       *
       * true  = hidden/lightweight boundary for modular tools
       * false = real/full school suite boundary
       */
      table.boolean('is_placeholder').notNullable().defaultTo(false).index()

      /**
       * Creator.
       *
       * This is the platform user who initiated the school boundary.
       */
      table
        .uuid('created_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      /**
       * Lifecycle timestamps
       */
      table.timestamp('onboarded_at').nullable()
      table.timestamp('suspended_at').nullable()
      table.timestamp('archived_at').nullable()
      table.timestamp('deleted_at').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
