import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Access {
  id: string
  status: string
  grantedAt: string | null
}

interface Instance {
  id: string
  status: string
  eduToolId: string
  schoolId: string
  startsAt: string | null
  endsAt: string | null
  trialEndsAt: string | null
}

interface CurrentAcademicPeriod {
  id: string
  label: string
  year: {
    id: string
    label: string
  }
}

interface VenueDetails {
  country?: string | null
  region?: string | null
  town?: string | null
  address?: string | null
}

interface School {
  id: string
  name: string
  code: string
  slug: string

  type: string | null
  ownershipType: string | null

  countryCode: string | null
  venueDetails: VenueDetails | null

  phone: string | null
  email: string | null
  website: string | null

  currentAcademicPeriod: CurrentAcademicPeriod | null
}

interface AccessContext {
  access: Access
  instance: Instance
  school: School
}

export const useFeesManagerAccessStore = defineStore(
  'fees-manager-access',
  () => {
    const api = useAdoFetch()

    const access = ref<AccessContext | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const checkedAt = ref<number | null>(null)
    const access_Id = ref<string>('')

    async function check(accessId: string, force=false) {
      // The current access was successfully checked within 5 minutes.
      if (
        (access.value?.access.id === accessId &&
        checkedAt.value &&
        Date.now() - checkedAt.value < 10 * 60 * 1000) && !force
      ) {
        return true
      }

      loading.value = true
      error.value = null

      try {
        const response = await api.get(
          `/edutools/fees_manager/${accessId}/access`,
        )

        const data = await response.json()

        if (!response.ok) {
          error.value = data.message ?? 'Unable to verify tool access.'
          access.value = null
          checkedAt.value = null

          return false
        }

        access.value = data.data
        checkedAt.value = Date.now()
        access_Id.value = accessId 
        return true
      } catch {
        error.value = 'Unable to verify tool access.'
        access.value = null
        checkedAt.value = null

        return false
      } finally {
        loading.value = false
      }
    }

    function clear() {
      access.value = null
      error.value = null
      checkedAt.value = null
    }

    function refresh(){
      if(access_Id.value) check(access_Id.value, true)
    }

    return {
      refresh,
      access,
      loading,
      error,
      checkedAt,
      check,
      clear,
    }
  },
)