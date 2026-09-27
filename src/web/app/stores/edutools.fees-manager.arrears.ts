import { defineStore } from 'pinia'

export type ArrearsOrderBy =
  | 'amount_desc'
  | 'amount_asc'
  | 'firstname_asc'
  | 'firstname_desc'

export interface ArrearsStudent {
  id: string
  name: string
  admissionNumber: string | null
  class: {
    id: string
    label: string
  } | null
  outstandingAmount: number
}

export interface ArrearsQuery {
  classId: string | null
  variantId: string | null
  orderBy: ArrearsOrderBy
}

export const useFeesManagerArrearsStore = defineStore(
  'fees-manager-arrears',
  () => {
    const api = useAdoFetch()

    const students = ref<ArrearsStudent[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const accessId = ref<string | null>(null)

    const classId = ref<string | null>(null)
    const variantId = ref<string | null>(null)

    const orderBy = ref<ArrearsOrderBy>('amount_desc')

    const lastQueryKey = ref<string | null>(null)
    const lastFetchedAt = ref<number | null>(null)

    const CACHE_TTL = 30_000

    const query = computed<ArrearsQuery>(() => ({
      classId: classId.value,
      variantId: variantId.value,
      orderBy: orderBy.value,
    }))

    const queryKey = computed(() =>
      JSON.stringify({
        accessId: accessId.value,
        classId: classId.value,
        variantId: variantId.value,
        orderBy: orderBy.value,
      }),
    )

    const hasData = computed(() => students.value.length > 0)

    function resetData() {
      students.value = []
      error.value = null
      lastQueryKey.value = null
      lastFetchedAt.value = null
    }

    function initialize(id: string) {
      if (accessId.value !== id) {
        accessId.value = id

        classId.value = null
        variantId.value = null
        orderBy.value = 'amount_desc'

        resetData()
      }
    }

    function setClass(id: string | null) {
      if (classId.value === id) {
        return
      }

      classId.value = id
      variantId.value = null
      students.value = []
      error.value = null
    }

    function setVariant(id: string | null) {
      if (variantId.value === id) {
        return
      }

      variantId.value = id
      students.value = []
      error.value = null
    }

    function setOrderBy(value: ArrearsOrderBy) {
      if (orderBy.value === value) {
        return
      }

      orderBy.value = value
      students.value = []
      error.value = null
    }

    function clear() {
      classId.value = null
      variantId.value = null
      orderBy.value = 'amount_desc'

      resetData()
    }

    function check(
      id: string,
      options?: {
        force?: boolean
      },
    ) {
      initialize(id)

      if (options?.force) {
        return false
      }

      if (
        !lastFetchedAt.value ||
        !lastQueryKey.value ||
        lastQueryKey.value !== queryKey.value
      ) {
        return false
      }

      return Date.now() - lastFetchedAt.value < CACHE_TTL
    }

    async function fetchArrears(
      id: string,
      options?: {
        force?: boolean
      },
    ) {
      initialize(id)

      if (!classId.value) {
        students.value = []
        error.value = null
        return
      }

      if (check(id, options)) {
        return
      }

      loading.value = true
      error.value = null

      try {
        const response = await api.get(
          `/edutools/fees_manager/${accessId.value}/arrears`,
          {
            query: {
              classId: classId.value,
              ...(variantId.value
                ? {
                    variantId: variantId.value,
                  }
                : {}),
              orderBy: orderBy.value,
            },
          },
        )

        const result = await response.json()

        if (!response.ok) {
          students.value = []
          error.value =
            result.message ?? 'Unable to load arrears.'
          return
        }

        students.value = (result.data ?? []).map(
          (student: ArrearsStudent) => ({
            id: student.id,
            name: student.name,
            admissionNumber: student.admissionNumber ?? null,
            class: student.class ?? null,
            outstandingAmount: Number(
              student.outstandingAmount ?? 0,
            ),
          }),
        )

        lastQueryKey.value = queryKey.value
        lastFetchedAt.value = Date.now()
      } catch {
        students.value = []
        error.value = 'Unable to load arrears.'
      } finally {
        loading.value = false
      }
    }

    function refresh(){
      if(classId.value) fetchArrears(classId.value, {force: true})
    }

    return {
      students,
      loading,
      error,
      refresh,

      accessId,

      classId,
      variantId,
      orderBy,

      query,
      hasData,

      initialize,
      setClass,
      setVariant,
      setOrderBy,
      fetchArrears,
      check,
      clear,
    }
  },
)