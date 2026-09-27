import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_staffs'

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
       * Staff identity inside the school.
       *
       * staff_code is school-specific, e.g. STF001, TCH203, COHWB-STF-001.
       */
      table.string('staff_code', 15).nullable()

      /**
       * Bio data
       */
      table.string('name').nullable()
      table.string('gender').nullable()
      table.string('nationality').nullable()
      table.date('date_of_birth').nullable()
      table.json('avatar').nullable()

      /**
       * Contact
       */
      table.string('phone').nullable()
      table.json('other_phones').nullable()
      table.string('email').nullable()
      table.json('address').nullable()

      table.string('job_title').nullable()

      /**
       * Employment information
       */
      table.json('employment_info').nullable()

      /**
       * Optional staff-level metadata.
       */
      table.json('meta').nullable()

      /**
       * Creator.
       *
       * The platform user who created this staff profile.
       */
      table
        .uuid('added_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      /**
       * Staff creator.
       *
       * The existing school staff member who created this profile.
       */
      table
        .uuid('added_by_staff_id')
        .nullable()
        .references('id')
        .inTable(this.tableName)
        .onDelete('SET NULL')
        .index()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      /**
       * Constraints and indexes
       */
      table.unique(['school_id', 'staff_code'])
      table.index(['school_id', 'email'])
      table.index(['school_id', 'phone'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
