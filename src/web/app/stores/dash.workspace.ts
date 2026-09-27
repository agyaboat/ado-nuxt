export type WorkspaceResourceType = 'suite' | 'tool'
export type WorkspaceFilter = 'all' | 'suite' | 'tool'

export interface WorkspaceStats {
  total: number
  suites: number
  tools: number
}

export interface WorkspaceResource {
  id: string

  resourceType: WorkspaceResourceType
  resourceId: string

  label: string
  sublabel: string | null
  description: string | null

  image: string | null

  sortOrder: number | null,

  meta: {
    key?: string,
    accessId: string
  }

}

export const useDashWorkspaceStore = defineStore('dash.workspace', () => {
  const items = ref<WorkspaceResource[]>([])
  const stats = ref<WorkspaceStats>({
    total: 0,
    suites: 0,
    tools: 0,
  })

  const activeFilter = ref<WorkspaceFilter>('all')
  const search = ref('')

  const loading = ref(false)
  const fetchError = ref<string | null>(null)
  const lastCheckedAt = ref(0)

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Suites', value: 'suite' },
    { label: 'Tools', value: 'tool' },
  ]

  const filteredItems = computed(() => {
    const term = search.value.trim().toLowerCase()

    return items.value.filter((item) => {
      const matchesFilter =
        activeFilter.value === 'all' || item.resourceType === activeFilter.value

      const matchesSearch =
        !term ||
        item.label.toLowerCase().includes(term) ||
        item.sublabel?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)

      return matchesFilter && matchesSearch
    })
  })

  function setWorkspace(data: { list: WorkspaceResource[]; stats: WorkspaceStats }) {
    items.value = data.list
    stats.value = data.stats
    lastCheckedAt.value = Date.now()
    fetchError.value = null
  }

  function setFilter(value: WorkspaceFilter) {
    activeFilter.value = value
  }

  function setSearch(value: string) {
    search.value = value
  }

  async function getWorkspace() {
    loading.value = true
    fetchError.value = null

    try {
      const res = await adofetch.get('/dash/workspace')
      const data = await res.json()

      if (res.ok) {
        setWorkspace(data.data)
        return { ok: true, data: data.data }
      }

      fetchError.value = data.message || 'Loading workspace failed.'
      useIsUnauthenticated(res)

      return { ok: false, message: fetchError.value }
    } catch {
      fetchError.value = 'Load failed. Network error!'
      return { ok: false, message: fetchError.value }
    } finally {
      loading.value = false
    }
  }

  function checkWorkspace() {
    const isFresh = Date.now() - lastCheckedAt.value < 10 * 60 * 1000

    if (items.value.length && isFresh) return

    getWorkspace()
  }

  async function refreshWorkspace() {
    await getWorkspace()
  }

  return {
    items,
    stats,

    activeFilter,
    search,
    filterOptions,
    filteredItems,

    loading,
    fetchError,
    lastCheckedAt,

    setFilter,
    setSearch,

    getWorkspace,
    checkWorkspace,
    refreshWorkspace,
  }
})