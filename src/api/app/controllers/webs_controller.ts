import type { HttpContext } from '@adonisjs/core/http'

export default class WebsController {
  async home({ logger, view }: HttpContext) {
    logger.error('Home page accessed')
    // session.put('visitedHome', true)
    // return { msg: 'Hello world from the home page', subdomains, request: request.qs().include }
    return view.render('pages/about', { info: 'This is the about page' })
  }
}
