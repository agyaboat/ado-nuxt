import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_classes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table
        .uuid('school_id')
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
        .index()

      table
        .uuid('class_group_id')
        .nullable()
        .references('id')
        .inTable('school_class_groups')
        .onDelete('RESTRICT')
        .index()

      /**
       * Display label chosen by the school.
       *
       * Examples:
       * - Class 1
       * - Class 6
       * - Form 2
       * - Form 2 Gold
       * - JHS 1
       */
      table.string('label').notNullable()

      /**
       * Main class ordering.
       *
       * Examples:
       * Class 1 => 1
       * Class 2 => 2
       * Class 6 => 6
       *
       * Variants/streams can keep this as null because their
       * parent class already carries the main order.
       */
      table.integer('sort_order').nullable()

      /**
       * Parent class for streams/variants.
       *
       * parent_id = null
       * => main/representative class
       *
       * parent_id = another class id
       * => variant/stream under that class
       *
       * Example:
       * Class 7
       * ├── Class 7 Gold
       * ├── Class 7 Diamond
       * └── Class 7 Silver
       */
      table
        .uuid('parent_id')
        .nullable()
        .references('id')
        .inTable(this.tableName)
        .onDelete('RESTRICT')
        .index()

      table.string('status').notNullable().defaultTo('active')

      table.json('meta').nullable()

      table
        .uuid('created_by_user_id')
        .nullable()
        .references('user_id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()

      table
        .uuid('created_by_staff_id')
        .nullable()
        .references('id')
        .inTable('school_staffs')
        .onDelete('SET NULL')
        .index()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      /**
       * Avoid duplicate labels within the same school.
       *
       * Example:
       * A school should not have two "Class 6" records.
       */
      table.unique(['school_id', 'label'])

      /**
       * Helpful indexes for class listing.
       */
      table.index(['school_id', 'parent_id'])
      table.index(['school_id', 'status'])
      table.index(['school_id', 'sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
