import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface FeeSchedule {
  id: string
  amount: number
  breakdown: Record<string, number> | null
  meta: {
    lastAppliedAt: string | null
  } | null
}

export interface FeeScheduleRow {
  class: {
    id: string
    label: string
  }

  day: FeeSchedule | null

  boarding: FeeSchedule | null
}

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
  periodScheme: 'semester' | 'trimester'
  startsAt: string
  endsAt: string
  periods: AcademicPeriod[]
}


interface AcademicPeriodResponse {
  period: AcademicPeriod
  year: AcademicYear
  feeSchedules: FeeScheduleRow[]
}

export const useFeesManagerAcademicPeriodStore = defineStore(
  'fees-manager-academic-period',
  () => {
    const api = useAdoFetch()

    /*
     * --------------------------------------------------------------------------
     * Data
     * --------------------------------------------------------------------------
     */

    const period = ref<AcademicPeriod | null>(null)
    const year = ref<AcademicYear | null>(null)

    const feeSchedules = ref<FeeScheduleRow[]>([])

    /*
     * --------------------------------------------------------------------------
     * Access / request state
     * --------------------------------------------------------------------------
     */

    const accessId = ref<string | null>(null)

    const periodId = ref<string | null>(null)

    const lastChecked = ref<number | null>(null)

    const loading = ref(false)

    const error = ref<string | null>(null)

    const CACHE_DURATION = 5 * 60 * 1000

    /*
     * --------------------------------------------------------------------------
     * Derived state
     * --------------------------------------------------------------------------
     */

    const hasPeriod = computed(() => {
      return period.value !== null
    })

    const hasClasses = computed(() => {
      return feeSchedules.value.length > 0
    })

    /*
     * --------------------------------------------------------------------------
     * Cache
     * --------------------------------------------------------------------------
     */

    async function check(
      access: string,
      academicPeriod: string,
    ) {
      const isSameResource =
        accessId.value === access &&
        periodId.value === academicPeriod

      const isFresh =
        lastChecked.value !== null &&
        Date.now() - lastChecked.value < CACHE_DURATION

      if (isSameResource && isFresh) {
        return true
      }

      return await fetchAcademicPeriod(
        access,
        academicPeriod,
      )
    }

    /*
     * --------------------------------------------------------------------------
     * Fetch
     * --------------------------------------------------------------------------
     */

    async function fetchAcademicPeriod(
      access: string,
      academicPeriod: string,
    ) {
      loading.value = true
      error.value = null

      try {
        const response = await api.get(
          `/edutools/fees_manager/${access}/academic-periods/${academicPeriod}`,
        )

        const result = await response.json()

        if (!response.ok) {
          period.value = null
          feeSchedules.value = []

          error.value =
            result.message ??
            'Unable to load academic period.'

          return false
        }

        const data =
          result.data as AcademicPeriodResponse

        period.value = data.period ?? null
        year.value = data.year ?? null

        feeSchedules.value =
          data.feeSchedules ?? []

        accessId.value = access
        periodId.value = academicPeriod
        lastChecked.value = Date.now()

        return true
      } catch {
        period.value = null
        feeSchedules.value = []

        error.value =
          'Unable to load academic period.'

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

    function refresh() {
      if(accessId.value && periodId.value) fetchAcademicPeriod(accessId.value, periodId.value)
    }

    function clear() {
      period.value = null
      feeSchedules.value = []

      accessId.value = null
      periodId.value = null
      lastChecked.value = null

      error.value = null
    }

    return {
      period,
      year,
      feeSchedules,

      accessId,
      periodId,
      lastChecked,

      loading,
      error,

      hasPeriod,
      hasClasses,

      refresh,
      check,
      fetchAcademicPeriod,
      clear,
    }
  },
)