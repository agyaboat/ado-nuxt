// stores/fees_manager_setup_wizard.ts

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface FeesManagerSetupState {
  class: boolean
  period: boolean
  fees: boolean
  student: boolean
}

const COMPLETE_STATE: FeesManagerSetupState = {
  class: true,
  period: true,
  fees: true,
  student: true,
}

export const useFeesManagerSetupWizardStore = defineStore(
  'fees-manager-setup-wizard',
  () => {
    const state = ref<FeesManagerSetupState>({
      class: false,
      period: false,
      fees: false,
      student: false,
    })

    const loading = ref(false)
    const error = ref<string | null>(null)
    const checkedAt = ref<number | null>(null)

    let interval: ReturnType<typeof setInterval> | null = null
    let accessId: string | null = null

    const complete = computed(() =>
      Object.values(state.value).every(Boolean),
    )

    const hasIncompleteSteps = computed(() =>
      Object.values(state.value).some((value) => !value),
    )

    async function check(id: string, force = false) {
      accessId = id

      if (
        !force &&
        checkedAt.value &&
        Date.now() - checkedAt.value < 60_000
      ) {
        return true
      }

      loading.value = true
      error.value = null

      try {
        const response = await useAdoFetch().get(
          `/edutools/fees_manager/${id}/setup-wizard`,
        )

        const data = await response.json()

        if (!response.ok) {
          error.value =
            data.message || 'Unable to check setup progress.'

          return false
        }

        state.value = {
          ...state.value,
          ...data.data,
        }

        checkedAt.value = Date.now()

        if (complete.value) {
          stopPolling()
        } else {
          startPolling()
        }

        return true
      } catch (err) {
        console.error('Fees Manager setup wizard error:', err)
        error.value = 'Unable to check setup progress.'
        return false
      } finally {
        loading.value = false
      }
    }

    function startPolling() {
      if (interval || complete.value || !accessId) return

      interval = setInterval(() => {
        if (accessId && !complete.value) {
          check(accessId, true)
        }
      }, 60_000)
    }

    function stopPolling() {
      if (!interval) return

      clearInterval(interval)
      interval = null
    }

    function reset() {
      stopPolling()

      state.value = {
        class: false,
        period: false,
        fees: false,
        student: false,
      }

      loading.value = false
      error.value = null
      checkedAt.value = null
      accessId = null
    }

    return {
      state,
      loading,
      error,
      checkedAt,
      complete,
      hasIncompleteSteps,
      check,
      startPolling,
      stopPolling,
      reset,
    }
  },
)