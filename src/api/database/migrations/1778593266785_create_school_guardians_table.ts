import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_guardians'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /**
       * School boundary
       */
      table
        .uuid('school_id')
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
        .index()

      /**
       * Guardian identity inside the school.
       *
       * guardian_code is school-specific, e.g. PAR001, GDN203, COHWB-GDN-001.
       */
      table.string('guardian_code', 50).nullable()

      /**
       * Bio data
       */
      table.string('name').notNullable()
      table.string('gender').nullable()
      table.string('nationality', 50).nullable()
      table.json('avatar').nullable()

      /**
       * Contact
       */
      table.string('phone').nullable()
      table.json('other_phones').nullable()
      table.string('email').nullable()
      table.json('address').nullable()

      /**
       * Work / background
       */
      table.json('work_info').nullable()

      /**
       * Guardian lifecycle status inside the school.
       *
       * active   = currently active as a school guardian
       * inactive = no longer actively linked or used
       * blocked  = restricted by the school
       */
      table.string('guardian_status').notNullable().defaultTo('active').index()

      /**
       * Optional guardian-level metadata.
       */
      table.json('meta').nullable()

      /**
       * Audit creator.
       *
       * added_by_user_id tracks the global ScholarSaaS platform user
       * who created this guardian profile.
       *
       * added_by_staff_id tracks the school staff member who created
       * this guardian profile.
       */
      table
        .uuid('added_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      table
        .uuid('added_by_staff_id')
        .nullable()
        .references('id')
        .inTable('school_staffs')
        .onDelete('SET NULL')
        .index()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      /**
       * Indexes and constraints
       */
      table.unique(['school_id', 'guardian_code'])

      table.index(['school_id', 'name'])
      table.index(['school_id', 'email'])
      table.index(['school_id', 'phone'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
