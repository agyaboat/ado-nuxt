import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_guardians'

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
       * Student profile
       */
      table
        .uuid('student_id')
        .notNullable()
        .references('id')
        .inTable('school_students')
        .onDelete('CASCADE')
        .index()

      /**
       * Guardian profile
       */
      table
        .uuid('guardian_id')
        .notNullable()
        .references('id')
        .inTable('school_guardians')
        .onDelete('CASCADE')
        .index()

      /**
       * Relationship between guardian and student.
       */
      table.string('relationship').notNullable().defaultTo('guardian').index()

      /**
       * Marks the primary guardian/contact for this student.
       */
      table.boolean('is_primary').notNullable().defaultTo(false).index()

      /**
       * Relationship lifecycle status.
       *
       * active   = guardian is actively linked to the student
       * inactive = relationship is currently not active
       * revoked  = relationship has been explicitly revoked
       */
      table.string('status').notNullable().defaultTo('active').index()

      /**
       * Optional relationship-level metadata.
       */
      table.json('meta').nullable()

      /**
       * Audit creator.
       *
       * added_by_user_id tracks the global ScholarSaaS platform user
       * who created this relationship.
       *
       * added_by_staff_id tracks the school staff member who created
       * this relationship.
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
       * Constraints and indexes
       */
      table.unique(['school_id', 'student_id', 'guardian_id'])

      table.index(['school_id', 'student_id', 'status'])
      table.index(['school_id', 'guardian_id', 'status'])
      table.index(['school_id', 'relationship'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
