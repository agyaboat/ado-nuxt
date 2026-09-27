<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  academicYear: AcademicYear
}>()

const emit = defineEmits<{
  updated: []
}>()

const api = useAdoFetch()
const route = useRoute()
const toast = useToast()

const academicScheduleStore =
  useFeesManagerAcademicScheduleStore()

const visible = ref(false)
const submitting = ref(false)

const begins = ref<Date | null>(null)
const ends = ref<Date | null>(null)

const accessId = computed(() => {
  return route.params.access_id as string
})

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const beginsValid = computed(() => {
  if (!begins.value) {
    return false
  }

  return (
    begins.value.getFullYear() ===
    new Date(props.academicYear.startsAt).getFullYear()
  )
})

const endsValid = computed(() => {
  if (!ends.value) {
    return false
  }

  return (
    ends.value.getFullYear() ===
    new Date(props.academicYear.endsAt).getFullYear()
  )
})

const datesOrderValid = computed(() => {
  if (!begins.value || !ends.value) {
    return false
  }

  return ends.value > begins.value
})

const canSubmit = computed(() => {
  return (
    begins.value !== null &&
    ends.value !== null &&
    beginsValid.value &&
    endsValid.value &&
    datesOrderValid.value
  )
})

/*
|--------------------------------------------------------------------------
| Date picker boundaries
|--------------------------------------------------------------------------
*/

const beginsYear = computed(() => {
  return new Date(props.academicYear.startsAt).getFullYear()
})

const endsYear = computed(() => {
  return new Date(props.academicYear.endsAt).getFullYear()
})

const beginsMinDate = computed(() => {
  return new Date(beginsYear.value, 0, 1)
})

const beginsMaxDate = computed(() => {
  return new Date(beginsYear.value, 11, 31)
})

const endsMinDate = computed(() => {
  return new Date(endsYear.value, 0, 1)
})

const endsMaxDate = computed(() => {
  return new Date(endsYear.value, 11, 31)
})

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

function open() {
  begins.value = new Date(props.academicYear.startsAt)
  ends.value = new Date(props.academicYear.endsAt)

  visible.value = true
}

function reset() {
  begins.value = null
  ends.value = null
}

function close() {
  if (submitting.value) {
    return
  }

  visible.value = false
  reset()
}

/*
|--------------------------------------------------------------------------
| Submit
|--------------------------------------------------------------------------
*/

async function submit() {
  if (!canSubmit.value || submitting.value) {
    return
  }

  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/academic-years/${props.academicYear.id}/update`,
      {
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          startsAt: begins.value!.toISOString(),
          endsAt: ends.value!.toISOString(),
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
        summary: 'Unable to update dates',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })

      return
    }

    await academicScheduleStore.fetchAcademicYears(
      accessId.value,
    )

    emit('updated')

    visible.value = false
    reset()

    toast.add({
      severity: 'success',
      summary: 'Academic year updated',
      detail: 'The academic year dates were updated successfully.',
      life: 3000,
    })
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : 'Unable to update academic year dates.',
    )

    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: 'Unable to update the academic year dates.',
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
  <span
    class="cursor-pointer"
    @click="open"
  >
    <slot>
      <Button
        label="Update Dates"
        icon="pi pi-calendar"
        type="button"
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    header="Update Academic Year Dates"
    :style="{ width: '30rem' }"
    :closable="!submitting"
    @hide="reset"
  >
    <form
      class="space-y-6"
      @submit.prevent="submit"
    >
      <!-- Academic Year -->
      <div>
        <label
          class="mb-2 block text-sm font-medium
            text-surface-900 dark:text-surface-0"
        >
          Academic Year
        </label>

        <div
          class="flex items-center justify-between rounded-lg
            border border-surface-200 bg-surface-50 px-3 py-2.5
            dark:border-surface-700 dark:bg-surface-900"
        >
          <span
            class="font-semibold text-surface-900
              dark:text-surface-0"
          >
            {{ props.academicYear.label }}
          </span>

          <span
            class="text-xs text-surface-500
              dark:text-surface-400"
          >
            <i class="pi pi-lock mr-1" />
            Locked
          </span>
        </div>
      </div>

      <!-- Period Scheme -->
      <div>
        <label
          class="mb-2 block text-sm font-medium
            text-surface-900 dark:text-surface-0"
        >
          Academic Structure
        </label>

        <div
          class="flex items-center justify-between rounded-lg
            border border-surface-200 bg-surface-50 px-3 py-2.5
            dark:border-surface-700 dark:bg-surface-900"
        >
          <span
            class="font-medium text-surface-900
              dark:text-surface-0"
          >
            {{
              props.academicYear.periodScheme === 'semester'
                ? 'Semester'
                : 'Trimester'
            }}
          </span>

          <span
            class="text-xs text-surface-500
              dark:text-surface-400"
          >
            <i class="pi pi-lock mr-1" />
            Locked
          </span>
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <!-- Begins -->
        <div>
          <label
            for="academic-year-begins"
            class="mb-2 block text-sm font-medium
              text-surface-900 dark:text-surface-0"
          >
            Begins
          </label>

          <DatePicker
            id="academic-year-begins"
            v-model="begins"
            date-format="dd/mm/yy"
            placeholder="DD/MM/YYYY"
            class="w-full"
            :disabled="submitting"
            :min-date="beginsMinDate"
            :max-date="beginsMaxDate"
            show-icon
          />

          <small
            v-if="begins && !beginsValid"
            class="mt-2 block text-red-500"
          >
            The start date must remain within
            {{ beginsYear }}.
          </small>
        </div>

        <!-- Ends -->
        <div>
          <label
            for="academic-year-ends"
            class="mb-2 block text-sm font-medium
              text-surface-900 dark:text-surface-0"
          >
            Ends
          </label>

          <DatePicker
            id="academic-year-ends"
            v-model="ends"
            date-format="dd/mm/yy"
            placeholder="DD/MM/YYYY"
            class="w-full"
            :disabled="submitting"
            :min-date="endsMinDate"
            :max-date="endsMaxDate"
            show-icon
          />

          <small
            v-if="ends && !endsValid"
            class="mt-2 block text-red-500"
          >
            The end date must remain within
            {{ endsYear }}.
          </small>
        </div>
      </div>

      <small
        v-if="begins && ends && !datesOrderValid"
        class="block text-red-500"
      >
        The ending date must be after the beginning date.
      </small>

      <div class="flex justify-end gap-3">
        <Button
          label="Cancel"
          severity="secondary"
          text
          type="button"
          :disabled="submitting"
          @click="close"
        />

        <Button
          label="Update Dates"
          icon="pi pi-check"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped></style>