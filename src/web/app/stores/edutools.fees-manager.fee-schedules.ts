import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface FeeSchedule {
  id: string
  class: {
    id: string
    label: string
  }
  accommodationType: string
  academicPeriod: {
    id: string
    label: string
    year: {
      id: string
      label: string
    }
  }
  amount: number
  breakdown: Record<string, number> | null
  status: string
  meta: {
    lastAppliedAt: string | null
  } | null
  updatedAt: string
}

interface FeeScheduleFilters {
  search: string
  academicPeriodId: string | null
  classId: string | null
  accommodation: string | null
}

interface Pagination {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
  firstPage: number
}

export const useFeesManagerFeeSchedulesStore = defineStore(
  'fees-manager-fee-schedules',
  () => {
    const api = useAdoFetch()

    const feeSchedules = ref<FeeSchedule[]>([])
    const pagination = ref<Pagination | null>(null)

    const filters = ref<FeeScheduleFilters>({
      search: '',
      academicPeriodId: null,
      classId: null,
      accommodation: null,
    })

    const accessId = ref<string | null>(null)
    const lastChecked = ref<number | null>(null)
    const lastQuery = ref<string | null>(null)

    const loading = ref(false)
    const error = ref<string | null>(null)

    const CACHE_DURATION = 5 * 60 * 1000

    function getQueryKey(
      id: string,
      page: number,
      limit: number,
    ) {
      return JSON.stringify({
        id,
        page,
        limit,
        filters: filters.value,
      })
    }

    function buildQuery(page: number, limit: number) {
      const params = new URLSearchParams()

      params.set('page', String(page))
      params.set('limit', String(limit))

      if (filters.value.search) {
        params.set('search', filters.value.search)
      }

      if (filters.value.academicPeriodId) {
        params.set(
          'academicPeriodId',
          filters.value.academicPeriodId,
        )
      }

      if (filters.value.classId) {
        params.set('classId', filters.value.classId)
      }

      if (filters.value.accommodation) {
        params.set(
          'accommodation',
          filters.value.accommodation,
        )
      }

      return params.toString()
    }

    function setFilters(newFilters: Partial<FeeScheduleFilters>) {
      filters.value = {
        ...filters.value,
        ...newFilters,
      }
    }

    async function check(
      id: string,
      page = 1,
      limit = 10,
    ) {
      const queryKey = getQueryKey(id, page, limit)

      if (
        accessId.value === id &&
        lastQuery.value === queryKey &&
        lastChecked.value &&
        Date.now() - lastChecked.value < CACHE_DURATION
      ) {
        return
      }

      await fetchFeeSchedules(id, page, limit)
    }

    async function fetchFeeSchedules(
      id: string,
      page = 1,
      limit = 10,
    ) {
      loading.value = true
      error.value = null
      accessId.value = id

      try {
        const query = buildQuery(page, limit)

        const response = await api.get(
          `/edutools/fees_manager/${id}/fee-schedules?${query}`,
        )

        const result = await response.json()

        if (!response.ok) {
          error.value =
            result.message ?? 'Unable to load fee schedules.'
          return
        }

        feeSchedules.value = result.data ?? []

        pagination.value = result.meta
          ? {
              currentPage: result.meta.currentPage,
              perPage: result.meta.perPage,
              total: result.meta.total,
              lastPage: result.meta.lastPage,
              firstPage: result.meta.firstPage,
            }
          : null

        lastQuery.value = getQueryKey(id, page, limit)
        lastChecked.value = Date.now()
      } catch {
        error.value = 'Unable to load fee schedules.'
      } finally {
        loading.value = false
      }
    }

    function clear() {
      feeSchedules.value = []
      pagination.value = null

      filters.value = {
        search: '',
        academicPeriodId: null,
        classId: null,
        accommodation: null,
      }

      accessId.value = null
      lastChecked.value = null
      lastQuery.value = null
      loading.value = false
      error.value = null
    }

    return {
      feeSchedules,
      pagination,
      filters,
      accessId,
      lastChecked,
      lastQuery,
      loading,
      error,
      setFilters,
      check,
      fetchFeeSchedules,
      clear,
    }
  },
)