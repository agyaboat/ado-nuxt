import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').notNullable().unique()
      table.string('first_name').notNullable()
      table.string('last_name').nullable()
      table.string('middle_name').nullable()
      table.string('email').unique().notNullable()
      table.timestamp('email_verified_at', { useTz: true }).nullable()
      table.string('password').notNullable()
      table.string('phone').nullable().unique().comment('with country code')
      table.string('citizenship').nullable().defaultTo('GH')
      table.string('national_id_url').nullable() //path to uploaded id
      table.timestamp('citizenship_verified_at').nullable()
      table.string('avatar_path').nullable()
      table.date('dob').nullable()
      table.enum('status', ['active', 'pending', 'inactive', 'banned']).defaultTo('active')
      table.timestamp('deleted_at').nullable()
      table.enum('role', ['user', 'admin', 'super']).defaultTo('user')
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
