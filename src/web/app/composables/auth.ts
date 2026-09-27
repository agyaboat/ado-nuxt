import type { ToastServiceMethods } from "primevue";

export const logout = async (toast: ToastServiceMethods) => {
    const api = useAdoFetch()
  try {
    await api.get('auth/v2/logout')
    navigateTo({ name: 'auth-index'}, {external: true})
  } catch {
    toast.add({
        summary: 'Failed',
        detail: 'An error occured while logging out.',
        severity: 'error'
    })
  }
}