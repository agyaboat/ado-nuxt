import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AcademicPeriod {
  id: string
  label: string
  startsAt: string
  endsAt: string
  sortOrder: number
}

export interface AcademicYear {
  id: string
  label: string
  startsAt: string
  endsAt: string
  periodScheme: 'semester' | 'trimester'
  periods: AcademicPeriod[]
}

export const useFeesManagerAcademicYearsStore = defineStore(
  'fees-manager-academic-years',
  () => {
    const api = useAdoFetch()

    const academicYears = ref<AcademicYear[]>([])
    const currentPeriod = ref<string | null>(null)

    const accessId = ref<string | null>(null)
    const lastChecked = ref<number | null>(null)

    const loading = ref(false)
    const error = ref<string | null>(null)

    const CACHE_DURATION = 5 * 60 * 1000

    /**
     * Check whether the academic years for this tool access
     * are still fresh before making another request.
     */
    async function check(id: string) {
      const isSameAccess = accessId.value === id

      const isFresh =
        lastChecked.value !== null &&
        Date.now() - lastChecked.value < CACHE_DURATION

      if (isSameAccess && isFresh && academicYears.value.length) {
        return true
      }

      return await fetchAcademicYears(id)
    }

    /**
     * Fetch academic years and their periods.
     */
    async function fetchAcademicYears(id: string) {
      loading.value = true
      error.value = null

      try {
        const response = await api.get(
          `/edutools/fees_manager/${id}/academic-years`,
        )

        const result = await response.json()

        if (!response.ok) {
          error.value =
            result.message ?? 'Unable to load academic years.'

          return false
        }

        academicYears.value = result.data
        currentPeriod.value = result.currentPeriod

        accessId.value = id
        lastChecked.value = Date.now()

        return true
      } catch {
        error.value = 'Unable to load academic years.'

        return false
      } finally {
        loading.value = false
      }
    }

    /**
     * Clear the academic-year state.
     */
    function clear() {
      academicYears.value = []
      currentPeriod.value = null
      accessId.value = null
      lastChecked.value = null
      error.value = null
    }

    const availablePeriodOrders = computed(() => {
      const orders = new Map<string, number[]>()

      for (const year of academicYears.value) {
        const limit = year.periodScheme === 'semester' ? 2 : 3
        const usedOrders = new Set(
          year.periods.map((period) => period.sortOrder),
        )

        orders.set(
          year.id,
          Array.from({ length: limit }, (_, index) => index + 1).filter(
            (order) => !usedOrders.has(order),
          ),
        )
      }

      return orders
    })

    return {
      academicYears,
      currentPeriod,
      accessId,
      lastChecked,
      loading,
      error,
      availablePeriodOrders,
      check,
      fetchAcademicYears,
      clear,
    }
  },
)