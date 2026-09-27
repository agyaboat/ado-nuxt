<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  accessId: string
  academicPeriodId: string
}>()

const emit = defineEmits<{
  synchronized: []
}>()

const api = useAdoFetch()
const toast = useToast()

const synchronizing = ref(false)

const endpoint = computed(
  () =>
    `/edutools/fees_manager/${props.accessId}/academic-periods/${props.academicPeriodId}/fee-schedules/synchronize`,
)

async function synchronize() {
  if (synchronizing.value) {
    return
  }

  synchronizing.value = true

  try {
    const response = await api.post(endpoint.value)

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to synchronize',
        detail:
          result.message ??
          'Unable to synchronize fee schedules.',
        life: 4000,
      })

      return
    }

    toast.add({
      severity: 'success',
      summary: 'Synchronization queued',
      detail:
        result.message ??
        'Fee schedule synchronization has been queued.',
      life: 3000,
    })

    const dashboardStore = useFeesManagerDashboardStore()
    dashboardStore.refresh()


    emit('synchronized')
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Unable to synchronize',
      detail:
        'Something went wrong while starting synchronization.',
      life: 4000,
    })
  } finally {
    synchronizing.value = false
  }
}
</script>

<template>
  <span @click="synchronize">
    <slot>
      <Button
        label="Synchronize"
        icon="pi pi-sync"
        severity="secondary"
        outlined
        size="small"
        :loading="synchronizing"
        :disabled="synchronizing"
        type="button"
      />
    </slot>
  </span>
</template>