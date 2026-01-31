import { fetchAuthUser } from "~/composables/services/auth"
// import { useUserStore } from "~/stores/dash.user"

// middleware/dashboard.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const tfp = to.fullPath ?? '/'
  const userStore = useUserStore()
  const toast = useToast()

  const THIRTY_MINUTES = 30 * 60 * 1000
  const now = Date.now()

  /**
   * 1. Store has a user
   */
  if (userStore.user) {
    const lastChecked = userStore.lastCheckedAt ?? 0
    const isStale = now - lastChecked > THIRTY_MINUTES

    if (!isStale) return true

    const freshUser = await fetchAuthUser()
    if( freshUser === 401 ) {
      userStore.clearUser()
      return navigateTo('/auth')
    }else if( freshUser === 'error' || freshUser === 'net-error' ){
      // do nothing, keep old user
      toast.add({
        summary: 'Network Error',
        detail: 'Failed to fetch user data.',
        severity: 'danger'
      })
      return abortNavigation()
    }

    if (freshUser.email !== userStore.user.email) {
      userStore.clearUser()
      return navigateTo(tfp, {external: true})
    }
    userStore.setUser(freshUser)
  }

  /**
   * 2. Store empty → try hydrate
   */
    const freshUser = await fetchAuthUser()
    if( freshUser === 401 ) {
        userStore.clearUser()
        return navigateTo('/auth')
    }else if( freshUser === 'error' || freshUser === 'net-error' ){
        // do nothing, keep old user
        toast.add({
        summary: 'Network Error',
        detail: 'Failed to fetch user data.',
        severity: 'danger'
        })
        return abortNavigation()
    }
    userStore.setUser(freshUser)
})
