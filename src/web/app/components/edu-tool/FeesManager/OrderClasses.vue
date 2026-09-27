<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const route = useRoute()
const api = useAdoFetch()
const classesStore = useFeesManagerClassesStore()
const toast = useToast()

const props = defineProps<{
  classes: SchoolClass[]
}>()

const emit = defineEmits<{
  reordered: []
}>()

const visible = ref(false)
const submitting = ref(false)

const orderedClasses = ref<SchoolClass[]>([])

const accessId = computed(() => route.params.access_id as string)

watch(
  () => props.classes,
  (classes) => {
    if (!visible.value) {
      orderedClasses.value = [...classes]
    }
  },
  { immediate: true },
)

function open() {
  orderedClasses.value = [...props.classes]
  visible.value = true
}

function close() {
  if (submitting.value) return

  visible.value = false
}

function onReorder(event: { value: SchoolClass[] }) {
  orderedClasses.value = event.value
}

async function submit() {
  if (submitting.value) return

  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/classes/reorder`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classIds: orderedClasses.value.map((schoolClass) => schoolClass.id),
        }),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to reorder classes',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })
      return
    }

    await classesStore.fetchClasses(accessId.value)

    toast.add({
      severity: 'success',
      summary: 'Classes reordered',
      detail: result.message ?? 'Classes reordered successfully.',
      life: 3000,
    })

    emit('reordered')
    visible.value = false
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: 'Unable to reorder classes.',
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

  <span @click="open">
    <slot>
      <Button
        label="Order Classes"
        icon="pi pi-sort-alt"
        type="button"
        severity="secondary"
        outlined
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    header="Order Classes"
    :style="{ width: '32rem' }"
    :closable="!submitting"
    :close-on-escape="!submitting"
  >
    <div class="space-y-6">
      <p class="text-sm text-surface-500 dark:text-surface-400">
        Drag and drop the classes to set their display order.
      </p>
      <!-- {{ orderedClasses.map(c => c.id) }} -->
      <OrderList
        v-model="orderedClasses"
        data-key="id"
        :dragdrop="true"
        @reorder="onReorder"
      >
        <template #option="{ option }">
          <div class="flex items-center gap-3 py-1">
            <i class="pi pi-grip-vertical text-surface-400" />

            <span class="font-medium text-surface-900 dark:text-surface-0">
              {{ option.label }}
            </span>
          </div>
        </template>
      </OrderList>

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
          label="Save Order"
          type="button"
          :loading="submitting"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>