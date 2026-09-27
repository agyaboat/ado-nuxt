<script setup lang="ts">
import { computed, ref } from 'vue'

const route = useRoute()
const api = useAdoFetch()
const classesStore = useFeesManagerClassesStore()
const toast = useToast()

const props = defineProps<{
  parentId?: string | null
}>()

const emit = defineEmits<{
  created: []
}>()

const visible = ref(false)
const submitting = ref(false)

const name = ref('')

const accessId = computed(() => route.params.access_id as string)

const isVariant = computed(() => !!props.parentId)

const resourceLabel = computed(() => {
  return isVariant.value ? 'Variant' : 'Class'
})

const canSubmit = computed(() => {
  return name.value.trim().length > 0
})

function open() {
  visible.value = true
}

function reset() {
  name.value = ''
}

function close() {
  if (submitting.value) return

  visible.value = false
  reset()
}

async function submit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/classes`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: name.value.trim(),
          parentId: props.parentId ?? null,
        }),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: `Unable to add ${resourceLabel.value.toLowerCase()}`,
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })
      return
    }

    await classesStore.fetchClasses(accessId.value)

    toast.add({
      severity: 'success',
      summary: `${resourceLabel.value} added`,
      detail: `${name.value.trim()} was added successfully.`,
      life: 3000,
    })

    emit('created')

    visible.value = false
    reset()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: `Unable to add the ${resourceLabel.value.toLowerCase()}.`,
      life: 5000,
    })
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open,
})
</script>

<template>
  <Button
    :label="`Add ${resourceLabel}`"
    icon="pi pi-plus"
    type="button"
    @click="open"
  />

  <Dialog
    v-model:visible="visible"
    modal
    :header="`Add ${resourceLabel}`"
    :style="{ width: '32rem' }"
    :closable="!submitting"
    :close-on-escape="!submitting"
  >
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
          :placeholder="isVariant ? 'e.g. General Arts' : 'e.g. SHS 1'"
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
          @click="close"
        />

        <Button
          :label="`Add ${resourceLabel}`"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>