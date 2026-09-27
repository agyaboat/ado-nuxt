import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').notNullable().unique()

      table.string('first_name').nullable()
      table.string('last_name').nullable()
      table.string('middle_name').nullable()

      table.string('username').unique().nullable()

      table.string('email').unique().notNullable()
      table.timestamp('email_verified_at', { useTz: true }).nullable()

      table.string('password').notNullable()

      table.string('phone').nullable().unique().comment('normalized international format')
      table.json('other_phones')

      table.string('country').nullable().defaultTo('GH')
      // table.string('national_id_url').nullable() //path to uploaded id
      // table.timestamp('citizenship_verified_at').nullable()
      table.json('nationality_details')

      table.json('profile_picture').nullable()
      table.date('dob').nullable()

      // ['active', 'pending', 'inactive', 'banned']
      table.string('status').defaultTo('active')
      table.json('configs').nullable()

      table.timestamp('deleted_at').nullable()
      table.string('role').defaultTo('user')
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
