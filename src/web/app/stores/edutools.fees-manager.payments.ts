import { defineStore } from 'pinia'
import { ref } from 'vue'

interface PaymentStudent {
  id: string
  name: string
  admissionNumber: string
}

interface PaymentClass {
  id: string
  label: string
}

export interface FeePayment {
  id: string
  student: PaymentStudent
  class: PaymentClass | null
  amount: number
  mode: string
  paidAt: string
  reference: string | null
}

interface PaginationMeta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
}

export interface PaymentsQuery {
  page?: number
  limit?: number
  search?: string | null
  academicPeriodId?: string | null
  classId?: string | null
  mode?: string | null
  date?: string | null
}

export const useFeesManagerPaymentsStore = defineStore(
  'fees-manager.payments',
  () => {
    const payments = ref<FeePayment[]>([])

    const meta = ref<PaginationMeta>({
      currentPage: 1,
      perPage: 20,
      total: 0,
      lastPage: 1,
    })

    const loading = ref(false)
    const error = ref<string | null>(null)

    const accessId = ref<string | null>(null)

    const lastFetchedAt = ref<number | null>(null)
    const lastQueryKey = ref<string | null>(null)

    const CACHE_TTL = 30_000

    function initialize(id: string) {
      if (accessId.value && accessId.value !== id) {
        clear()
      }

      accessId.value = id
    }

    function buildQueryKey(params: PaymentsQuery = {}) {
      return JSON.stringify({
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        search: params.search?.trim() || null,
        academicPeriodId: params.academicPeriodId ?? null,
        classId: params.classId ?? null,
        mode: params.mode ?? null,
        date: params.date ?? null,
      })
    }

    function hasValidCache(queryKey: string) {
      if (!payments.value.length && meta.value.total === 0) {
        return false
      }

      if (!lastFetchedAt.value) {
        return false
      }

      if (lastQueryKey.value !== queryKey) {
        return false
      }

      return Date.now() - lastFetchedAt.value < CACHE_TTL
    }

    async function check(params: PaymentsQuery = {}) {
      const queryKey = buildQueryKey(params)

      if (hasValidCache(queryKey)) {
        return true
      }

      await fetchPayments(params)

      return false
    }

    async function fetchPayments(params: PaymentsQuery = {}) {
      if (!accessId.value) {
        throw new Error(
          'Fees Manager access has not been initialized.',
        )
      }

      const page = params.page ?? 1
      const limit = params.limit ?? meta.value.perPage

      const queryKey = buildQueryKey({
        ...params,
        page,
        limit,
      })

      loading.value = true
      error.value = null

      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        })

        if (params.search?.trim()) {
          query.set('search', params.search.trim())
        }

        if (params.academicPeriodId) {
          query.set(
            'academicPeriodId',
            params.academicPeriodId,
          )
        }

        if (params.classId) {
          query.set('classId', params.classId)
        }

        if (params.mode) {
          query.set('mode', params.mode)
        }

        if (params.date) {
          query.set('date', params.date)
        }

        const response = await useAdoFetch().get(
          `/edutools/fees_manager/${accessId.value}/payments?${query.toString()}`,
        )

        const result = await response.json()

        if (!response.ok) {
          error.value =
            result.message ?? 'Unable to load payments.'

          return {
            response,
            result,
          }
        }

        payments.value = result.data ?? []

        meta.value = {
          currentPage: result.meta?.currentPage ?? page,
          perPage: result.meta?.perPage ?? limit,
          total: result.meta?.total ?? 0,
          lastPage: result.meta?.lastPage ?? 1,
        }

        lastFetchedAt.value = Date.now()
        lastQueryKey.value = queryKey

        return {
          response,
          result,
        }
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : 'Unable to load payments.'

        return {
          response: { ok: false, status: 0 },
          result: null,
        }
      } finally {
        loading.value = false
      }
    }

    function refresh() {
      fetchPayments({})
    }

    function clear() {
      payments.value = []

      meta.value = {
        currentPage: 1,
        perPage: 20,
        total: 0,
        lastPage: 1,
      }

      loading.value = false
      error.value = null
      lastFetchedAt.value = null
      lastQueryKey.value = null
    }

    return {
      payments,
      refresh,
      meta,
      loading,
      error,
      accessId,
      lastFetchedAt,

      initialize,
      check,
      fetchPayments,
      clear,
    }
  },
)