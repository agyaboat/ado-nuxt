import { defineStore } from 'pinia'
import { ref } from 'vue'

interface DashboardPeriod {
  id: string
  label: string
  startsAt: string
  endsAt: string
  academicYearId: string
}

interface DashboardFinancial {
  expected: number
  collected: number
  outstanding: number
  collectionRate: number
}

interface DashboardStudents {
  paidInFull: number
  partiallyPaid: number
  outstanding: number
}

interface DashboardData {
  period: DashboardPeriod | null
  academicYearLabel: string | null
  financial: DashboardFinancial
  students: DashboardStudents
}

export const useFeesManagerDashboardStore = defineStore(
  'fees-manager-dashboard',
  () => {
    const api = useAdoFetch()

    const data = ref<DashboardData>({
      period: null,
      academicYearLabel: null,
      financial: {
        expected: 0,
        collected: 0,
        outstanding: 0,
        collectionRate: 0,
      },
      students: {
        paidInFull: 0,
        partiallyPaid: 0,
        outstanding: 0,
      },
    })

    const accessId = ref<string | null>(null)
    const periodId = ref<string | null>(null)
    const lastChecked = ref<number | null>(null)

    const loading = ref(false)
    const error = ref<string | null>(null)

    const CACHE_DURATION = 5 * 60 * 1000

    /**
     * Check whether the dashboard data is still fresh
     * for the requested tool access and academic period.
     */
    async function check(
      id: string,
      academicPeriodId: string | null,
    ) {
      if (!academicPeriodId) {
        clear()
        return true
      }

      const isSameAccess = accessId.value === id
      const isSamePeriod = periodId.value === academicPeriodId

      const isFresh =
        lastChecked.value !== null &&
        Date.now() - lastChecked.value < CACHE_DURATION

      if (
        isSameAccess &&
        isSamePeriod &&
        isFresh
      ) {
        return true
      }

      return await fetchDashboard(id, academicPeriodId)
    }

    /**
     * Fetch dashboard data for a specific academic period.
     */
    async function fetchDashboard(
      id: string,
      academicPeriodId: string,
    ) {
      loading.value = true
      error.value = null

      try {
        const response = await api.get(
          `/edutools/fees_manager/${id}/dashboard/${academicPeriodId}`,
        )

        const result = await response.json()

        if (!response.ok) {
          error.value =
            result.message ?? 'Unable to load dashboard.'

          return false
        }

        data.value = result.data
        accessId.value = id
        periodId.value = academicPeriodId
        lastChecked.value = Date.now()

        return true
      } catch {
        error.value = 'Unable to load dashboard.'
        return false
      } finally {
        loading.value = false
      }
    }

    function refresh(){
      if(accessId.value && periodId.value) fetchDashboard(accessId.value, periodId.value)
    }

    /**
     * Reset the dashboard to its empty state.
     */
    function clear() {
      data.value = {
        period: null,
        academicYearLabel: null,
        financial: {
          expected: 0,
          collected: 0,
          outstanding: 0,
          collectionRate: 0,
        },
        students: {
          paidInFull: 0,
          partiallyPaid: 0,
          outstanding: 0,
        },
      }

      accessId.value = null
      periodId.value = null
      lastChecked.value = null
      error.value = null
    }

    return {
      refresh,
      data,
      accessId,
      periodId,
      lastChecked,
      loading,
      error,
      check,
      fetchDashboard,
      clear,
    }
  },
)