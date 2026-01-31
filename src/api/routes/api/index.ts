import r from '@adonisjs/core/services/router'
export function ApiRoutesEntry() {
  r.group(() => {
    // api routes here
  }).prefix('api')
}
