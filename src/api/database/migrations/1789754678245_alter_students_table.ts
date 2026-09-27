import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'school_students'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('upload_id').nullable()

      table.index(['upload_id'], 'school_students_upload_id_index')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['upload_id'], 'school_students_upload_id_index')

      table.dropColumn('upload_id')
    })
  }
}
