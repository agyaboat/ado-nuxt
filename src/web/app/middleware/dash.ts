export default defineNuxtRouteMiddleware((to, from) => {
    console.log('Navigating from', from.fullPath, 'to', to.fullPath)
})
