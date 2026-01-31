import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  // origin: ['http://localhost:3000'],
  origin: env
    .get('ALLOWED_HOST')
    .split(',')
    .map((h) => h.trim())
    .filter((h) => h.length > 0),
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

console.log('CORS ORIGIN:', corsConfig.origin)

export default corsConfig
