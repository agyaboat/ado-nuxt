<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  student: Student
}>()

const route = useRoute()
const api = useAdoFetch()
const studentsStore = useFeesManagerStudentsStore()
const toast = useToast()
const confirm = useConfirm()
const emits = defineEmits(['deleted'])

const accessId = computed(() => route.params.access_id as string)

function remove() {
  confirm.require({
    message: `Are you sure you want to delete "${props.student.firstName} ${props.student.lastName}"?`,
    header: 'Delete Student',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    rejectProps: {
      severity: 'secondary',
      outlined: true,
    },
    acceptLabel: 'Delete',
    acceptProps: {
      severity: 'danger',
    },
    accept: deleteStudent,
  })
}

async function deleteStudent() {
  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/students/${props.student.id}`,
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
        summary: 'Unable to delete student',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })
      return
    }

    await studentsStore.fetchStudents(accessId.value)

    toast.add({
      severity: 'success',
      summary: 'Student deleted',
      detail: result.message ?? 'Student deleted successfully.',
      life: 3000,
    })

    emits('deleted')
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: 'Unable to delete the student.',
      life: 5000,
    })
  }
}
</script>

<template>
  <span @click="remove">
    <slot>
      <Button
        icon="pi pi-trash"
        severity="danger"
        outlined
        size="small"
        @click.stop="remove"
      />
    </slot>
  </span>
</template>