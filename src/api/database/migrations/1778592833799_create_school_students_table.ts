import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_students'

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
       * Student identity inside the school.
       *
       * student_code is school-specific, e.g. STD001, ADM203, COHWB-STU-001.
       * admission_number can store the official school admission/index number.
       */
      table.string('student_code', 50).nullable()
      table.string('admission_number', 50).nullable()

      /**
       * Bio data
       */
      table.string('first_name').notNullable()
      table.string('middle_name').nullable()
      table.string('last_name').notNullable()

      table.string('gender').nullable()

      table.string('nationality', 50).nullable()

      table.date('date_of_birth').nullable()

      table.json('avatar').nullable()

      table.string('phone').nullable()
      table.json('other_phones').nullable()
      table.string('email').nullable()
      table.json('address').nullable()

      table.string('residential_status').nullable()

      /**
       * Student lifecycle status inside the school.
       *
       * active      = currently studying
       * suspended   = temporarily restricted
       * transferred = moved to another school
       * withdrawn   = left before completion
       * graduated   = completed programme/school
       * inactive    = not currently active
       */
      table.string('student_status').notNullable().defaultTo('active').index()

      // table.json('admission_info').nullable()
      table.date('admitted_at').nullable()
      table.date('graduated_at').nullable()
      table.date('left_at').nullable()

      /**
       * Optional student-level metadata.
       *
       * Useful for extra school-specific details without changing the schema too early.
       */
      table.json('meta').nullable()

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
      table.unique(['school_id', 'student_code'])
      table.unique(['school_id', 'admission_number'])

      table.index(['school_id', 'first_name', 'last_name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
