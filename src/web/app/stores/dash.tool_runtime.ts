export interface ToolRuntimeTool {
  id: string
  key: string
  label: string
  description: string | null
  type: string
  category: string | null
  image: Record<string, any> | null
  meta: Record<string, any> | null
}

export interface ToolRuntimeSchool {
  id: string
  name: string
  slug?: string | null
  code?: string | null
}

export interface ToolRuntimeSubscription {
  id: string
  status: string
  schoolId: string | null
  subscriberType: string
  subscriberId: string
  source: string
  entitlements: Record<string, any> | null
  config: Record<string, any> | null
  meta: Record<string, any> | null
}

export interface ToolRuntime {
  subscription: ToolRuntimeSubscription
  tool: ToolRuntimeTool
  school: ToolRuntimeSchool | null

  requiresSetup: boolean
  setupRequirements: Record<string, any> | null
}

export const useDashToolRuntimeStore = defineStore('dash.tool_runtime', () => {
  const currentToolSubscriptionId = ref<string | null>(null)
  const runtime = ref<ToolRuntime | null>(null)

  const loading = ref(false)
  const fetchError = ref<string | null>(null)
  const notFound = ref(false)

  const currentTool = computed(() => runtime.value?.tool || null)
  const currentSubscription = computed(() => runtime.value?.subscription || null)
  const currentSchool = computed(() => runtime.value?.school || null)

  const toolKey = computed(() => currentTool.value?.key || null)
  const requiresSetup = computed(() => Boolean(runtime.value?.requiresSetup))

  function setCurrentToolSubscriptionId(id: string | null) {
    currentToolSubscriptionId.value = id
  }

  function setRuntime(data: ToolRuntime) {
    runtime.value = data
    currentToolSubscriptionId.value = data.subscription.id
    fetchError.value = null
    notFound.value = false
  }

  function clearRuntime() {
    runtime.value = null
    currentToolSubscriptionId.value = null
    loading.value = false
    fetchError.value = null
    notFound.value = false
  }

  async function getRuntime(subscriptionId?: string) {
    const id = subscriptionId || currentToolSubscriptionId.value

    if (!id) {
      fetchError.value = 'Tool subscription id is missing.'
      return { ok: false, message: fetchError.value }
    }

    loading.value = true
    fetchError.value = null
    notFound.value = false

    try {
      const res = await adofetch.get(`/dash/tools/${id}/runtime`)
      const data = await res.json()

      if (res.ok) {
        setRuntime(data.data)
        return { ok: true, data: data.data }
      }

      if (res.status === 404) {
        notFound.value = true
      }

      fetchError.value = data.message || 'Loading tool failed.'
      useIsUnauthenticated(res)

      return { ok: false, message: fetchError.value }
    } catch {
      fetchError.value = 'Load failed. Network error!'
      return { ok: false, message: fetchError.value }
    } finally {
      loading.value = false
    }
  }

  return {
    currentToolSubscriptionId,
    runtime,

    loading,
    fetchError,
    notFound,

    currentTool,
    currentSubscription,
    currentSchool,

    toolKey,
    requiresSetup,

    setCurrentToolSubscriptionId,
    setRuntime,
    clearRuntime,
    getRuntime,
  }
})