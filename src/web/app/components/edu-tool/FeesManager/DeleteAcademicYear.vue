<script setup lang="ts">

const props = defineProps<{
  academicYear: AcademicYear
}>()

const emit = defineEmits<{
  deleted: []
}>()

const api = useAdoFetch()
const route = useRoute()
const toast = useToast()
const confirm = useConfirm()

// const academicYearsStore = useFeesManagerAcademicYearsStore()

const submitting = ref(false)

const accessId = computed(() => {
  return route.params.access_id as string
})

const hasPeriods = computed(() => {
  return props.academicYear.periods.length > 0
})

function confirmDelete() {
  if (hasPeriods.value || submitting.value) {
    return
  }

  confirm.require({
    message:
      `Confirm deletion of Academic Year ${props.academicYear.label}? ` +
      'This action cannot be undone.',
    header: 'Delete Academic Year',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: () => deleteYear(),
  })
}

async function deleteYear() {
  if (hasPeriods.value || submitting.value) {
    return
  }

  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/academic-years/${props.academicYear.id}/delete`,
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
        summary: 'Unable to delete academic year',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })

      return
    }

    // await academicYearsStore.fetchAcademicYears(accessId.value)

    toast.add({
      severity: 'success',
      summary: 'Academic year deleted',
      detail: `${props.academicYear.label} was deleted successfully.`,
      life: 3000,
    })

    emit('deleted')
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : 'Unable to delete academic year.',
    )

    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: 'Unable to delete the academic year.',
      life: 5000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Button
    label="Delete"
    icon="pi pi-trash"
    severity="danger"
    text
    size="small"
    type="button"
    :disabled="hasPeriods || submitting"
    :loading="submitting"
    @click="confirmDelete"
  />
</template>