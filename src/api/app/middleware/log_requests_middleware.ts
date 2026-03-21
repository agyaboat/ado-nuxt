import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import string from '@adonisjs/core/helpers/string'

export default class LogRequestsMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    /**
     * Capture the start time before calling next().
     * This happens in the downstream phase.
     */
    const startTime = process.hrtime()

    /**
     * Call next() to execute remaining middleware and route handler.
     * The await ensures we wait for the entire chain to complete.
     */
    await next()

    /**
     * After next() completes, we're in the upstream phase.
     * The response is ready, so we can log the completion details.
     */
    const endTime = process.hrtime(startTime)
    const responseStatus = response.getStatus()
    const uri = request.url()
    const method = request.method()

    console.log(`${method} ${uri}: ${responseStatus} (${string.prettyHrTime(endTime)})`)
  }
}
