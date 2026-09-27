export interface MarketTool {
  id: string
  key: string
  label: string
  sublabel: string
  description: string | null

  // type: 'tool' | 'suite'
  category: string | null

  isFeatured: boolean
  // isSubscribed: boolean

  image: string
  meta: Record<string, any> | null

  sortOrder: number | null
}

export const useDashToolsExplorerStore = defineStore('dash.tools_explorer', () => {
  const tools = ref<MarketTool[]>([])
  const loading = ref(false)
  const fetchError = ref<string | null>(null)
  const lastCheckedAt = ref(0)

  const selectedCategory = ref('All')
  const search = ref('')

  const categories = computed(() => {
    const list = tools.value
      .map((tool) => tool.category)
      .filter(Boolean)
      .map((category) => formatCategory(category!))

    return ['All', ...new Set(list)]
  })

  const featuredTool = computed(() => {
    return tools.value.find((tool) => tool.isFeatured) || null
  })

  const visibleTools = computed(() => {
    let list = tools.value

    if (featuredTool.value) {
      list = list.filter((tool) => tool.id !== featuredTool.value?.id)
    }

    if (selectedCategory.value !== 'All') {
      const category = selectedCategory.value.toLowerCase().replaceAll(' ', '_')
      list = list.filter((tool) => tool.category === category)
    }

    if (search.value.trim()) {
      const term = search.value.trim().toLowerCase()

      list = list.filter((tool) => {
        return (
          tool.label.toLowerCase().includes(term) ||
          tool.key.toLowerCase().includes(term) ||
          tool.description?.toLowerCase().includes(term) ||
          tool.category?.toLowerCase().includes(term)
        )
      })
    }

    return list
  })

  function formatCategory(category: string) {
    return category
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  function setSearch(value: string) {
    search.value = value
  }

  function setCategory(value: string) {
    selectedCategory.value = value
  }

  function setTools(data: MarketTool[]) {
    tools.value = data
    lastCheckedAt.value = Date.now()
    fetchError.value = null
  }

  async function getTools() {
    loading.value = true
    fetchError.value = null

    try {
      const res = await adofetch.get('/dash/tools/market')
      const data = await res.json()

      if (res.ok) {
        setTools(data.data || data)
      } else {
        fetchError.value = data.message || 'Loading tools failed.'
        useIsUnauthenticated(res)
      }
    } catch {
      fetchError.value = 'Load failed. Network error!'
    } finally {
      loading.value = false
    }
  }

  function checkTools() {
    const isFresh = Date.now() - lastCheckedAt.value < 10 * 60 * 1000

    if (tools.value.length && isFresh) return

    getTools()
  }

  async function refreshTools() {
    await getTools()
  }

  const subscribing = ref(false)
  const subscribeError = ref<string | null>(null)

  async function subscribeToTool(toolId: string) {
    subscribing.value = true
    subscribeError.value = null

    try {
      const res = await adofetch.post(`/dash/tools/market/${toolId}/subscribe`, {})
      const data = await res.json()

      if (res.ok || res.status === 201) {
        return {
          ok: true,
          data: data.data,
          message: data.message || 'Tool added to your workspace.',
        }
      }

      subscribeError.value = data.message || 'Tool subscription failed.'
      useIsUnauthenticated(res)

      return {
        ok: false,
        message: subscribeError.value,
      }
    } catch {
      subscribeError.value = 'Subscription failed. Network error!'

      return {
        ok: false,
        message: subscribeError.value,
      }
    } finally {
      subscribing.value = false
    }
  }

  return {
    tools,
    loading,
    fetchError,
    lastCheckedAt,

    selectedCategory,
    search,
    categories,
    featuredTool,
    visibleTools,

    setSearch,
    setCategory,
    getTools,
    checkTools,
    refreshTools,

    subscribing,
    subscribeError,
    subscribeToTool,
  }
})