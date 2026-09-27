import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SchoolClass {
  id: string
  label: string
  sortOrder: number | null
  parentId: string | null
  status: string
  studentCount: number
  variants: SchoolClass[] | null
}

export const useFeesManagerClassesStore = defineStore(
  'fees-manager-classes',
  () => {
    const api = useAdoFetch()

    const classes = ref<SchoolClass[]>([])
    const accessId = ref<string | null>(null)
    const lastChecked = ref<number | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const CACHE_DURATION = 5 * 60 * 1000

    async function check(id: string) {
      if (
        accessId.value === id &&
        lastChecked.value &&
        Date.now() - lastChecked.value < CACHE_DURATION
      ) {
        return
      }

      await fetchClasses(id)
    }

    async function fetchClasses(id: string) {
      loading.value = true
      error.value = null
      accessId.value = id

      try {
        const response = await api.get(
          `/edutools/fees_manager/${id}/classes`,
        )

        const result = await response.json()

        if (!response.ok) {
          error.value = result.message ?? 'Unable to load classes.'
          return
        }

        classes.value = result.data ?? []
        lastChecked.value = Date.now()
      } catch {
        error.value = 'Unable to load classes.'
      } finally {
        loading.value = false
      }
    }

    function clear() {
      classes.value = []
      accessId.value = null
      lastChecked.value = null
      loading.value = false
      error.value = null
    }

    const selectableClasses = computed(() => {
      return classes.value.flatMap((schoolClass) => {
        if (schoolClass.variants?.length) {
          return schoolClass.variants
        }

        return [schoolClass]
      })
    })

    return {
      classes,
      accessId,
      lastChecked,
      loading,
      error,
      check,
      fetchClasses,
      selectableClasses,
      clear,
    }
  },
)