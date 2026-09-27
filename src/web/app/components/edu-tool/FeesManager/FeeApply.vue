<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  fee: FeeSchedule
}>()

const emit = defineEmits<{
  applied: []
}>()

const route = useRoute()
const api = useAdoFetch()
const toast = useToast()
const confirm = useConfirm()

const submitting = ref(false)

const accessId = computed(() => String(route.params.access_id))

async function apply() {
  if (submitting.value) {
    return
  }

  confirm.require({
    message:
      'Confirm this action:',
    header: 'Apply Fee Schedule',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptLabel: 'Continue',
    accept: async () => {
      await submit()
    },
  })
}

async function submit() {
  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/fee-schedules/${props.fee.id}/apply`,
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to apply fee',
        detail:
          result.message ?? 'Unable to queue fee schedule application.',
        life: 4000,
      })

      return
    }

    toast.add({
      severity: 'success',
      summary: 'Application queued',
      detail:
        result.message ??
        'Fee schedule application has been queued successfully.',
      life: 4000,
    })

    emit('applied')
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Unable to apply fee',
      detail: 'Something went wrong while applying the fee schedule.',
      life: 4000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <slot :apply="apply" :loading="submitting">
    <Button
      label="Apply Now"
      icon="pi pi-check"
      type="button"
      :loading="submitting"
      @click="apply"
    />
  </slot>
</template>