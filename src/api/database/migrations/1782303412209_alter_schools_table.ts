import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'schools'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /**
       * Operational academic period currently selected for the school.
       *
       * This is the canonical academic context used by Core and downstream
       * modules for operations that need the school's current period.
       *
       * It is intentionally separate from period dates/status:
       * - dates define the period's temporal boundaries
       * - status defines its lifecycle
       * - this pointer defines the school's current operational context
       *
       * The application should validate that the selected period belongs
       * to this school and is valid for operational use.
       */

      table
        .uuid('current_academic_period_id')
        .nullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('SET NULL')
        .index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('current_academic_period_id')
    })
  }
}
