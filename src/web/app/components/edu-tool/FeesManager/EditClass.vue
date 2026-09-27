<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const route = useRoute()
const api = useAdoFetch()
const classesStore = useFeesManagerClassesStore()
const toast = useToast()

const props = defineProps<{
  schoolClass: SchoolClass
}>()

const emit = defineEmits<{
  updated: []
  cancel: []
}>()

const submitting = ref(false)
const name = ref('')

watch(
  () => props.schoolClass.label,
  (label) => {
    name.value = label
  },
  { immediate: true },
)

const accessId = computed(() => route.params.access_id as string)

const canSubmit = computed(() => {
  return name.value.trim().length > 0
})

const resourceLabel = computed(() => {
  return props.schoolClass.parentId ? 'Variant' : 'Class'
})

async function submit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/classes/${props.schoolClass.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: name.value.trim(),
          parentId: props.schoolClass.parentId,
        }),
        query: {
          _method: 'PATCH',
        },
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: `Unable to update ${resourceLabel.value.toLowerCase()}`,
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })
      return
    }

    await classesStore.fetchClasses(accessId.value)

    toast.add({
      severity: 'success',
      summary: `${resourceLabel.value} updated`,
      detail: `${name.value.trim()} was updated successfully.`,
      life: 3000,
    })

    emit('updated')
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: `Unable to update the ${resourceLabel.value.toLowerCase()}.`,
      life: 5000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="submit"
  >
    <div>
      <label
        for="class-name"
        class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
      >
        {{ resourceLabel }} name
      </label>

      <InputText
        id="class-name"
        v-model="name"
        class="w-full"
        autocomplete="off"
      />
    </div>

    <div
      class="flex justify-end gap-2 border-t border-surface-200 pt-5 dark:border-surface-800"
    >
      <Button
        label="Cancel"
        type="button"
        severity="secondary"
        outlined
        :disabled="submitting"
        @click="emit('cancel')"
      />

      <Button
        label="Save Changes"
        type="submit"
        :loading="submitting"
        :disabled="!canSubmit"
      />
    </div>
  </form>
</template>