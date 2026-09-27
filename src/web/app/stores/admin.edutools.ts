import type { ToastServiceMethods } from "primevue"

export type EduToolStatus = 'active' | 'inactive' | 'deprecated' | 'archived'
export type EduToolType = 'tool' | 'suite'

export interface EduTool {
  id: string
  key: string
  label: string
  description?: string | null

  type: EduToolType
  category?: string | null
  status: EduToolStatus

  isMarketVisible: boolean
  isFeatured: boolean
  sortOrder?: number | null

  image?: Record<string, any> | null
  requirements?: Record<string, any> | null
  pages?: any[] | null
  defaultConfig?: Record<string, any> | null
  meta?: Record<string, any> | null

  subscriptionsCount?: number
  activeSubscriptionsCount?: number

  createdAt?: string
  updatedAt?: string
}

export interface EduToolPayload {
  key: string
  label: string
  description?: string | null

  type: EduToolType
  category?: string | null
  status: EduToolStatus

  is_market_visible: boolean
  isFeatured: boolean
  sort_order?: number | null

  image?: Record<string, any> | null
  requirements?: Record<string, any> | null
  pages?: any[] | null
  default_config?: Record<string, any> | null
  meta?: Record<string, any> | null
}

export interface toolPayload {
  payload: EduToolPayload,
  toast: ToastServiceMethods
}

export interface delToolPayload {
  id: string,
  toast: ToastServiceMethods
}

interface GetToolsOptions {
  fresh?: boolean
}

export const useAdminEduToolsStore = defineStore('admin.edutools', () => {
  const tools = ref<EduTool[]>([])
  const selectedTool = ref<EduTool | null>(null)

  const lastCheckedAt = ref<number>(0)
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const fetchError = ref<string | null>(null)
  const saveError = ref<string | null>(null)

  const totalTools = computed(() => tools.value.length)
  const activeTools = computed(() => tools.value.filter((tool) => tool.status === 'active'))
  const inactiveTools = computed(() => tools.value.filter((tool) => tool.status === 'inactive'))
  const deprecatedTools = computed(() => tools.value.filter((tool) => tool.status === 'deprecated'))
  const archivedTools = computed(() => tools.value.filter((tool) => tool.status === 'archived'))
  const marketVisibleTools = computed(() => tools.value.filter((tool) => tool.isMarketVisible))

  const activeToolsCount = computed(() => activeTools.value.length)
  const inactiveToolsCount = computed(() => inactiveTools.value.length)
  const deprecatedToolsCount = computed(() => deprecatedTools.value.length)
  const archivedToolsCount = computed(() => archivedTools.value.length)
  const marketVisibleToolsCount = computed(() => marketVisibleTools.value.length)

  function setTools(data: EduTool[]) {
    tools.value = data
    lastCheckedAt.value = Date.now()
    loading.value = false
    fetchError.value = null
  }

  function clearTools() {
    tools.value = []
    selectedTool.value = null
    lastCheckedAt.value = 0
    loading.value = false
    saving.value = false
    deleting.value = false
    fetchError.value = null
    saveError.value = null
  }

  function setSelectedTool(tool: EduTool | null) {
    selectedTool.value = tool
  }

  async function getTools(options: GetToolsOptions = {}) {
    loading.value = true
    fetchError.value = null

    try {
      const query = options.fresh ? '?fresh=true' : ''
      const res = await adofetch.get(`/dash/admin/edu-tools${query}`)
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

    if (tools.value.length && isFresh) {
      return
    }

    getTools()
  }

  async function refreshTools() {
    await getTools({ fresh: true })
  }

  async function createTool({payload, toast}: toolPayload) {
    saving.value = true
    saveError.value = null

    try {
      const res = await adofetch.post('/dash/admin/edu-tools', {
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (res.ok || res.status === 201) {
        const tool = data.data || data
        tools.value = [tool, ...tools.value]
        return { ok: true, data: tool }
      }
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: data.message ?? 'An error occured while creating tool'
      })
      saveError.value = data.message || 'Tool creation failed.'
      useIsUnauthenticated(res)

      return { ok: false, message: saveError.value }
    } catch {
      saveError.value = 'Create failed. Network error!'
      return { ok: false, message: saveError.value }
    } finally {
      saving.value = false
    }
  }

  async function updateTool(id: string, {payload, toast}: toolPayload) {
    saving.value = true
    saveError.value = null

    try {
      const res = await adofetch.put(`/dash/admin/edu-tools/${id}`, {
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (res.ok) {
        const updatedTool = data.data || data

        tools.value = tools.value.map((tool) => {
          if (tool.id === id) return updatedTool
          return tool
        })

        if (selectedTool.value?.id === id) {
          selectedTool.value = updatedTool
        }

        return { ok: true, data: updatedTool }
      }

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: data.message ?? 'An error occured while creating tool'
      })
      saveError.value = data.message || 'Tool update failed.'
      useIsUnauthenticated(res)

      return { ok: false, message: saveError.value }
    } catch {
      saveError.value = 'Update failed. Network error!'
      return { ok: false, message: saveError.value }
    } finally {
      saving.value = false
    }
  }

  async function updateToolStatus(id: string, status: EduToolStatus) {
    saving.value = true
    saveError.value = null

    try {
      const res = await adofetch.patch(`/dash/admin/edu-tools/${id}/status`, {
        body: JSON.stringify({ status })
      })
      const data = await res.json()

      if (res.ok) {
        const updatedTool = data.data || data

        tools.value = tools.value.map((tool) => {
          if (tool.id === id) return updatedTool
          return tool
        })

        if (selectedTool.value?.id === id) {
          selectedTool.value = updatedTool
        }

        return { ok: true, data: updatedTool }
      }

      saveError.value = data.message || 'Tool status update failed.'
      useIsUnauthenticated(res)

      return { ok: false, message: saveError.value }
    } catch {
      saveError.value = 'Status update failed. Network error!'
      return { ok: false, message: saveError.value }
    } finally {
      saving.value = false
    }
  }

  async function deleteTool({id, toast}: delToolPayload) {
    deleting.value = true
    saveError.value = null

    try {
      const res = await adofetch.del(`/dash/admin/edu-tools/${id}`)
      const data = await res.json()

      if (res.ok) {
        tools.value = tools.value.filter((tool) => tool.id !== id)

        if (selectedTool.value?.id === id) {
          selectedTool.value = null
        }

        return { ok: true, data }
      }

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: data.message ?? 'An error occured while deleting tool'
      })

      saveError.value = data.message || 'Tool deletion failed.'
      useIsUnauthenticated(res)

      return { ok: false, message: saveError.value }
    } catch {
      saveError.value = 'Delete failed. Network error!'
      return { ok: false, message: saveError.value }
    } finally {
      deleting.value = false
    }
  }

  function patchTool(id: string, payload: Partial<EduTool>) {
    tools.value = tools.value.map((tool) => {
      if (tool.id === id) {
        return {
          ...tool,
          ...payload,
        }
      }

      return tool
    })

    if (selectedTool.value?.id === id) {
      selectedTool.value = {
        ...selectedTool.value,
        ...payload,
      }
    }
  }

  return {
    tools,
    selectedTool,

    loading,
    saving,
    deleting,
    fetchError,
    saveError,
    lastCheckedAt,

    totalTools,
    activeTools,
    inactiveTools,
    deprecatedTools,
    archivedTools,
    marketVisibleTools,

    activeToolsCount,
    inactiveToolsCount,
    deprecatedToolsCount,
    archivedToolsCount,
    marketVisibleToolsCount,

    setTools,
    clearTools,
    setSelectedTool,

    getTools,
    checkTools,
    refreshTools,

    createTool,
    updateTool,
    updateToolStatus,
    deleteTool,

    patchTool,
  }
})