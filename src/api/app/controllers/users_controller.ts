import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return 'List of users'
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({}: HttpContext) {
    return 'User created'
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return `User with ID ${params.id}`
  }

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params }: HttpContext) {
    return `User with ID ${params.id} updated`
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    return `User with ID ${params.id} deleted`
  }
}
