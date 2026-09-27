import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Student {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  admissionNumber: string | null
  studentCode: string | null
  phone: string | null
  email: string | null
  gender: string | null
  residentialStatus: string | null
  studentStatus: string
  class: {
    id: string
    label: string
    year: string
  } | null
}

interface StudentFilters {
  search: string
  classId: string | null
  accommodation: string | null
  status: string | null
}

interface Pagination {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
  firstPage: number
}

export const useFeesManagerStudentsStore = defineStore(
  'fees-manager-students',
  () => {
    const api = useAdoFetch()

    const students = ref<Student[]>([])
    const pagination = ref<Pagination | null>(null)

    const filters = ref<StudentFilters>({
      search: '',
      classId: null,
      accommodation: null,
      status: null,
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

      if (filters.value.classId) {
        params.set('classId', filters.value.classId)
      }

      if (filters.value.accommodation) {
        params.set(
          'accommodation',
          filters.value.accommodation,
        )
      }

      if (filters.value.status) {
        params.set('status', filters.value.status)
      }

      return params.toString()
    }

    function setFilters(newFilters: Partial<StudentFilters>) {
      filters.value = {
        ...filters.value,
        ...newFilters,
      }
    }

    async function check(
      id: string,
      page = 1,
      limit = 20,
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

      await fetchStudents(id, page, limit)
    }

    async function fetchStudents(
      id: string,
      page = 1,
      limit = 20,
    ) {
      loading.value = true
      error.value = null
      accessId.value = id

      try {
        const query = buildQuery(page, limit)

        const response = await api.get(
          `/edutools/fees_manager/${id}/students?${query}`,
        )

        const result = await response.json()

        if (!response.ok) {
          error.value =
            result.message ?? 'Unable to load students.'
          return
        }

        students.value = result.data ?? []

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
        error.value = 'Unable to load students.'
      } finally {
        loading.value = false
      }
    }

    function clear() {
      students.value = []
      pagination.value = null
      filters.value = {
        search: '',
        classId: null,
        accommodation: null,
        status: null,
      }
      accessId.value = null
      lastChecked.value = null
      lastQuery.value = null
      loading.value = false
      error.value = null
    }

    return {
      students,
      pagination,
      filters,
      accessId,
      lastChecked,
      lastQuery,
      loading,
      error,
      setFilters,
      check,
      fetchStudents,
      clear,
    }
  },
)