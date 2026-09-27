<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  fee: FeeSchedule
}>()

const emit = defineEmits<{
  deleted: []
}>()

const route = useRoute()
const api = useAdoFetch()
const toast = useToast()
const confirm = useConfirm()

const feeSchedulesStore = useFeesManagerFeeSchedulesStore()

const deleting = ref(false)

const accessId = computed(() => String(route.params.access_id))

function confirmDelete() {
  if (deleting.value) {
    return
  }

  confirm.require({
    header: 'Delete Fee Schedule',
    message: 'Are you sure you want to delete this fee schedule?',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptProps: {
      severity: 'danger',
    },
    accept: async () => {
      await deleteFee()
    },
  })
}

async function deleteFee() {
  deleting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/fee-schedules/${props.fee.id}`,
      {
        query: {
          _method: 'DELETE',
        },
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to delete fee',
        detail: result.message ?? 'Unable to delete fee schedule.',
        life: 4000,
      })

      return
    }

    const page = feeSchedulesStore.pagination?.currentPage ?? 1
    const limit = feeSchedulesStore.pagination?.perPage ?? 10

    await feeSchedulesStore.fetchFeeSchedules(
      accessId.value,
      page,
      limit,
    )

    toast.add({
      severity: 'success',
      summary: 'Fee deleted',
      detail: result.message ?? 'Fee schedule deleted successfully.',
      life: 3000,
    })

    emit('deleted')
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Unable to delete fee',
      detail: 'Something went wrong while deleting the fee schedule.',
      life: 4000,
    })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <slot :delete-fee="confirmDelete" :loading="deleting">
    <Button
      label="Delete"
      icon="pi pi-trash"
      severity="danger"
      text
      type="button"
      :loading="deleting"
      @click="confirmDelete"
    />
  </slot>
</template>