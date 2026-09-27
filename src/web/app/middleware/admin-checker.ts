import { fetchAuthUser } from "~/composables/services/auth"
// import { useUserStore } from "~/stores/dash.user"

// middleware/dashboard.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const tfp = to.fullPath ?? '/'
  const userStore = useUserStore()
  const toast = useToast()

  if (!userStore.user) {
    return navigateTo('/auth')
  }

  // const user = userStore.user
  if (!userStore.user.role || userStore.user.role === 'client') {
    // console.log(userStore.user)
    toast.add({
      summary: 'Access Denied',
      detail: 'You do not have permission to access this page.',
      severity: 'error'
    })
    return navigateTo('/')
  }

  return true
})
