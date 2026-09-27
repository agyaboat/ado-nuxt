// import { fetchAuthUser } from '~/composables/services/auth'
// import type { User } from '~/stores/dash.user'

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore()
  const toast = useToast()

  const THIRTY_MINUTES = 30 * 60 * 1000
  const now = Date.now()

  /**
   * User exists in store and the cached
   * authentication state is still fresh.
   */
  if (
    userStore.user &&
    userStore.lastCheckedAt &&
    now - userStore.lastCheckedAt < THIRTY_MINUTES
  ) {
    return
  }

  /**
   * Store is empty or stale.
   * Ask the backend for the authenticated user.
   */
  userStore.loading = true

  try {
    const user = await fetchAuthUser()

    if (user === 401) {
      userStore.clearUser()

      return navigateTo('/auth')
    }

    else if (user === 'error') {
      toast.add({
        summary: 'Unable to verify session',
        detail: 'We could not verify your session. Please try again.',
        severity: 'error',
      })

      return abortNavigation()
    }

    userStore.setUser(user)

    return
  } catch (error) {
    console.error('Auth middleware error:', error)

    toast.add({
      summary: 'Network Error',
      detail: 'Failed to verify your session.',
      severity: 'error',
    })

    return abortNavigation()
  } finally {
    userStore.loading = false
  }
})

export const fetchAuthUser = async () => {
  const response = await useAdoFetch().get('/auth/user')

  if (response.status === 401) {
    return 401
  }

  if (!response.ok) {
    return 'error'
  }

  const data = await response.json()

  return data.user as User
}