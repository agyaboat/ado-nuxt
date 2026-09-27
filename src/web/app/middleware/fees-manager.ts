export default defineNuxtRouteMiddleware(async (to) => {
  const toast = useToast()
  const accessId = to.params.access_id as string

  if (!accessId) {
    toast.add({
      severity: 'error',
      summary: 'Invalid Access',
      detail: 'A valid Fees Manager access is required.',
    })

    return abortNavigation()
  }

  const accessStore = useFeesManagerAccessStore()

  const valid = await accessStore.check(accessId)

  if (!valid) {
    toast.add({
      severity: 'error',
      summary: 'Access Denied',
      detail: accessStore.error ?? 'You do not have access to this Fees Manager.',
    })

    return abortNavigation()
  }
})