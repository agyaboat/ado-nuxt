import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

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

export interface AcademicScheduleResponse {
  current: AcademicYear | null
  past: AcademicYear[]
  currentPeriod: string | null
}

export const useFeesManagerAcademicScheduleStore = defineStore(
  'fees-manager-academic-schedule',
  () => {
    const api = useAdoFetch()

    /*
     * --------------------------------------------------------------------------
     * Academic schedule state
     * --------------------------------------------------------------------------
     */

    const currentAcademicYear = ref<AcademicYear | null>(null)

    const pastAcademicYears = ref<AcademicYear[]>([])

    /*
     * ID of the school's current academic period.
     *
     * The current academic year is derived from this on the backend,
     * while this value remains useful to the UI for identifying the
     * current period.
     */
    const currentPeriod = ref<string | null>(null)

    /*
     * --------------------------------------------------------------------------
     * Access / cache state
     * --------------------------------------------------------------------------
     */

    const accessId = ref<string | null>(null)

    const lastChecked = ref<number | null>(null)

    const loading = ref(false)

    const error = ref<string | null>(null)

    const CACHE_DURATION = 5 * 60 * 1000

    /*
     * --------------------------------------------------------------------------
     * Derived state
     * --------------------------------------------------------------------------
     */

    const hasCurrentAcademicYear = computed(() => {
      return currentAcademicYear.value !== null
    })

    const hasPastAcademicYears = computed(() => {
      return pastAcademicYears.value.length > 0
    })

    /*
     * Available period sort orders for each academic year.
     *
     * Semester  -> 1, 2
     * Trimester -> 1, 2, 3
     */
    const availablePeriodOrders = computed(() => {
      const orders = new Map<string, number[]>()

      const years = [
        ...(currentAcademicYear.value
          ? [currentAcademicYear.value]
          : []),
        ...pastAcademicYears.value,
      ]

      for (const year of years) {
        const limit =
          year.periodScheme === 'semester'
            ? 2
            : 3

        const usedOrders = new Set(
          year.periods.map((period) => period.sortOrder),
        )

        orders.set(
          year.id,
          Array.from(
            { length: limit },
            (_, index) => index + 1,
          ).filter(
            (order) => !usedOrders.has(order),
          ),
        )
      }

      return orders
    })

    /*
     * --------------------------------------------------------------------------
     * Cache check
     * --------------------------------------------------------------------------
     */

    async function check(id: string) {
      const isSameAccess = accessId.value === id

      const isFresh =
        lastChecked.value !== null &&
        Date.now() - lastChecked.value < CACHE_DURATION

      if (isSameAccess && isFresh) {
        return true
      }

      return await fetchAcademicYears(id)
    }

    /*
     * --------------------------------------------------------------------------
     * Fetch academic schedule
     * --------------------------------------------------------------------------
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
          currentAcademicYear.value = null
          pastAcademicYears.value = []
          currentPeriod.value = null

          error.value =
            result.message ??
            'Unable to load academic schedule.'

          return false
        }

        const data = result.data as AcademicScheduleResponse

        currentAcademicYear.value =
          data?.current ?? null

        pastAcademicYears.value =
          data?.past ?? []

        currentPeriod.value =
          data?.currentPeriod ?? null

        accessId.value = id
        lastChecked.value = Date.now()

        return true
      } catch {
        currentAcademicYear.value = null
        pastAcademicYears.value = []
        currentPeriod.value = null

        error.value =
          'Unable to load academic schedule.'

        return false
      } finally {
        loading.value = false
      }
    }

    /*
     * --------------------------------------------------------------------------
     * Clear
     * --------------------------------------------------------------------------
     */

    function clear() {
      currentAcademicYear.value = null
      pastAcademicYears.value = []
      currentPeriod.value = null

      accessId.value = null
      lastChecked.value = null

      error.value = null
    }

    return {
      currentAcademicYear,
      pastAcademicYears,
      currentPeriod,

      accessId,
      lastChecked,
      loading,
      error,

      hasCurrentAcademicYear,
      hasPastAcademicYears,
      availablePeriodOrders,

      check,
      fetchAcademicYears,
      clear,
    }
  },
)