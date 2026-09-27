import User from '#models/user'
import env from '#start/env'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class SeedSuper extends BaseCommand {
  static commandName = 'create:super'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Hello world from "SeedSuper"')
    const email = env.get('SUPER_EMAIL')
    const firstName = env.get('SUPER_FIRST_NAME')
    const lastName = env.get('SUPER_LAST_NAME')

    if (!email || !firstName) {
      this.logger.error(
        'One or more required environment variables for the super user are not set.'
      )
      return
    }
    const user = await User.findBy('email', email)
    if (!user) {
      await User.create({
        firstName,
        lastName,
        email,
        password: env.get('SUPER_PASSWORD'),
        role: 'super',
      })
      this.logger.info(`Super user created with email: ${email}`)
    } else {
      this.logger.info(`Super user already exists with email: ${email}`)
      if (user.role !== 'super') {
        user.role = 'super'
        await user.save()
        this.logger.info(`User role updated to super for email: ${email}`)
      }
    }
  }
}
