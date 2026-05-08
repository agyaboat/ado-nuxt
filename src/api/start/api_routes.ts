import router from '@adonisjs/core/services/router'

router.get('/api/2', () => {
  return { hello: 'Welcome to AdoNuxt API!' }
})
