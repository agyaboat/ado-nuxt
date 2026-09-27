import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fee_schedules'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('meta').nullable()
      table.json('change_logs').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('meta')
      table.dropColumn('change_logs')
    })
  }
}
