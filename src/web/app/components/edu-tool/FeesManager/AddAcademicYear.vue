<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits<{
  created: []
}>()

const api = useAdoFetch()
const route = useRoute()
const toast = useToast()

const academicScheduleStore = useFeesManagerAcademicScheduleStore()
const dashboardStore = useFeesManagerDashboardStore()

const visible = ref(false)
const submitting = ref(false)

const academicYear = ref('')
const periodScheme =
  ref<'semester' | 'trimester' | null>(null)

const begins = ref<Date | null>(null)
const ends = ref<Date | null>(null)

const accessId = computed(() => route.params.access_id as string)

/*
 * --------------------------------------------------------------------------
 * Academic year options
 * --------------------------------------------------------------------------
 *
 * Onboarding only permits:
 *
 * current year - 1
 * current year
 *
 * Example in 2026:
 * 2025/2026
 * 2026/2027
 */
const currentYear = new Date().getFullYear()

const academicYearOptions = [
  {
    label: `${currentYear - 1}/${currentYear}`,
    value: `${currentYear - 1}/${currentYear}`,
  },
  {
    label: `${currentYear}/${currentYear + 1}`,
    value: `${currentYear}/${currentYear + 1}`,
  },
]

const periodSchemes = [
  {
    label: 'Semester',
    value: 'semester',
  },
  {
    label: 'Trimester',
    value: 'trimester',
  },
]

/*
 * --------------------------------------------------------------------------
 * Academic year dates
 * --------------------------------------------------------------------------
 */

const academicYearYears = computed(() => {
  if (!academicYear.value) {
    return {
      start: null,
      end: null,
    }
  }

  const [start, end] = academicYear.value
    .split('/')
    .map(Number)

  return {
    start: start ?? null,
    end: end ?? null,
  }
})

const beginsYearValid = computed(() => {
  const { start } = academicYearYears.value

  if (!begins.value || start === null) {
    return false
  }

  return begins.value.getFullYear() === start
})

const endsYearValid = computed(() => {
  const { end } = academicYearYears.value

  if (!ends.value || end === null) {
    return false
  }

  return ends.value.getFullYear() === end
})

const datesOrderValid = computed(() => {
  if (!begins.value || !ends.value) {
    return false
  }

  return ends.value > begins.value
})

const canSubmit = computed(() => {
  return (
    academicYear.value !== '' &&
    periodScheme.value !== null &&
    beginsYearValid.value &&
    endsYearValid.value &&
    datesOrderValid.value
  )
})

const beginsMinDate = computed(() => {
  const { start } = academicYearYears.value

  if (start === null) {
    return undefined
  }

  return new Date(start, 0, 1)
})

const beginsMaxDate = computed(() => {
  const { start } = academicYearYears.value

  if (start === null) {
    return undefined
  }

  return new Date(start, 11, 31)
})

const endsMinDate = computed(() => {
  const { end } = academicYearYears.value

  if (end === null) {
    return undefined
  }

  return new Date(end, 0, 1)
})

const endsMaxDate = computed(() => {
  const { end } = academicYearYears.value

  if (end === null) {
    return undefined
  }

  return new Date(end, 11, 31)
})

/*
 * --------------------------------------------------------------------------
 * Dialog lifecycle
 * --------------------------------------------------------------------------
 */

function open() {
  reset()
  visible.value = true
}

function reset() {
  academicYear.value = ''
  periodScheme.value = null
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
 * --------------------------------------------------------------------------
 * Submit
 * --------------------------------------------------------------------------
 */

async function submit() {
  if (!canSubmit.value || submitting.value) {
    return
  }

  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/academic-years`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: academicYear.value,
          periodScheme: periodScheme.value,
          startsAt: begins.value?.toISOString(),
          endsAt: ends.value?.toISOString(),
        }),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to start academic year',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })

      return
    }

    /*
     * Force a fresh schedule fetch.
     *
     * We intentionally don't use `check()` here because the existing
     * cached schedule may still be considered fresh.
     */
    await academicScheduleStore.fetchAcademicYears(
      accessId.value,
    )

    dashboardStore.refresh()
    emit('created')

    visible.value = false
    reset()

    toast.add({
      severity: 'success',
      summary: 'Academic year started',
      detail: `${academicYear.value} is now available in the academic schedule.`,
      life: 4000,
    })
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : 'Unable to start academic year.',
    )

    toast.add({
      severity: 'error',
      summary: 'Unable to start academic year',
      detail: 'Something went wrong while starting the academic year.',
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
        label="Start Academic Year"
        icon="pi pi-plus"
        type="button"
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    header="Start Academic Year"
    :style="{ width: '28rem' }"
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
          for="academic-year"
          class="mb-2 block text-sm font-medium
            text-surface-900 dark:text-surface-0"
        >
          Academic Year
        </label>

        <Select
          id="academic-year"
          v-model="academicYear"
          :options="academicYearOptions"
          option-label="label"
          option-value="value"
          placeholder="Select academic year"
          class="w-full"
          :disabled="submitting"
          autofocus
        />

        <small
          class="mt-2 block text-surface-500
            dark:text-surface-400"
        >
          Choose the academic year the school is starting
          or currently operating in.
        </small>
      </div>

      <!-- Academic Structure -->
      <div>
        <label
          for="period-scheme"
          class="mb-2 block text-sm font-medium
            text-surface-900 dark:text-surface-0"
        >
          Academic Structure
        </label>

        <Select
          id="period-scheme"
          v-model="periodScheme"
          :options="periodSchemes"
          option-label="label"
          option-value="value"
          placeholder="Select academic structure"
          class="w-full"
          :disabled="submitting"
        />

        <small
          class="mt-2 block text-surface-500
            dark:text-surface-400"
        >
          This determines how many academic periods the
          school can have in the year.
        </small>
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
            :disabled="submitting || !academicYear"
            :min-date="beginsMinDate"
            :max-date="beginsMaxDate"
            show-icon
          />

          <small
            v-if="
              begins &&
              academicYear &&
              !beginsYearValid
            "
            class="mt-2 block text-red-500"
          >
            The start date must fall within
            {{ academicYearYears.start }}.
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
            :disabled="submitting || !academicYear"
            :min-date="endsMinDate"
            :max-date="endsMaxDate"
            show-icon
          />

          <small
            v-if="
              ends &&
              academicYear &&
              !endsYearValid
            "
            class="mt-2 block text-red-500"
          >
            The end date must fall within
            {{ academicYearYears.end }}.
          </small>
        </div>
      </div>

      <!-- Date ordering -->
      <small
        v-if="
          begins &&
          ends &&
          !datesOrderValid
        "
        class="block text-red-500"
      >
        The ending date must be after the beginning date.
      </small>

      <!-- Actions -->
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
          label="Start Academic Year"
          icon="pi pi-arrow-right"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped></style>