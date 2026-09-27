<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  academicYear: AcademicYear
  period: AcademicPeriod
}>()

const emit = defineEmits<{
  updated: []
}>()

const api = useAdoFetch()
const route = useRoute()
const toast = useToast()

const visible = defineModel<boolean>('visible', {
  default: false,
})

const submitting = ref(false)

const label = ref('')
const begins = ref<Date | null>(null)
const ends = ref<Date | null>(null)

const accessId = computed(() => {
  return route.params.access_id as string
})

/*
|--------------------------------------------------------------------------
| Academic year boundaries
|--------------------------------------------------------------------------
*/

const yearStartsAt = computed(() => {
  return new Date(props.academicYear.startsAt)
})

const yearEndsAt = computed(() => {
  return new Date(props.academicYear.endsAt)
})

/*
|--------------------------------------------------------------------------
| Sibling periods
|--------------------------------------------------------------------------
*/

const siblingPeriods = computed(() => {
  return props.academicYear.periods.filter((period) => {
    return period.id !== props.period.id
  })
})

/*
|--------------------------------------------------------------------------
| Label validation
|--------------------------------------------------------------------------
*/

const normalizedLabel = computed(() => {
  return label.value.trim().toLowerCase()
})

const labelValid = computed(() => {
  return normalizedLabel.value.length > 0
})

const duplicateLabel = computed(() => {
  if (!normalizedLabel.value) {
    return false
  }

  return siblingPeriods.value.some((period) => {
    return (
      period.label.trim().toLowerCase() ===
      normalizedLabel.value
    )
  })
})

const labelAvailable = computed(() => {
  return labelValid.value && !duplicateLabel.value
})

/*
|--------------------------------------------------------------------------
| Date validation
|--------------------------------------------------------------------------
*/

const beginsValid = computed(() => {
  if (!begins.value) {
    return false
  }

  return (
    begins.value >= yearStartsAt.value &&
    begins.value <= yearEndsAt.value
  )
})

const endsValid = computed(() => {
  if (!ends.value) {
    return false
  }

  return (
    ends.value >= yearStartsAt.value &&
    ends.value <= yearEndsAt.value
  )
})

const datesOrderValid = computed(() => {
  if (!begins.value || !ends.value) {
    return false
  }

  return ends.value > begins.value
})

/*
|--------------------------------------------------------------------------
| Sibling overlap
|--------------------------------------------------------------------------
*/

const overlapsSibling = computed(() => {
  if (!begins.value || !ends.value) {
    return false
  }

  return siblingPeriods.value.some((period) => {
    const siblingStartsAt = new Date(period.startsAt)
    const siblingEndsAt = new Date(period.endsAt)

    return (
      begins.value! < siblingEndsAt &&
      ends.value! > siblingStartsAt
    )
  })
})

/*
|--------------------------------------------------------------------------
| Form
|--------------------------------------------------------------------------
*/

const canSubmit = computed(() => {
  return (
    labelAvailable.value &&
    beginsValid.value &&
    endsValid.value &&
    datesOrderValid.value &&
    !overlapsSibling.value
  )
})

/*
|--------------------------------------------------------------------------
| Date picker boundaries
|--------------------------------------------------------------------------
*/

const beginsMinDate = computed(() => {
  return yearStartsAt.value
})

const beginsMaxDate = computed(() => {
  return yearEndsAt.value
})

const endsMinDate = computed(() => {
  return yearStartsAt.value
})

const endsMaxDate = computed(() => {
  return yearEndsAt.value
})

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

function load() {
  label.value = props.period.label
  begins.value = new Date(props.period.startsAt)
  ends.value = new Date(props.period.endsAt)
}

function reset() {
  label.value = ''
  begins.value = null
  ends.value = null
}

watch(
  visible,
  (value) => {
    if (value) {
      load()
    }
  },
)

/*
|--------------------------------------------------------------------------
| Close
|--------------------------------------------------------------------------
*/

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
      `/edutools/fees_manager/${accessId.value}/academic-periods/${props.period.id}/update`,
      {
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          label: label.value.trim(),
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
        summary: 'Unable to update academic period',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })

      return
    }

    toast.add({
      severity: 'success',
      summary: 'Academic period updated',
      detail: `${label.value.trim()} was updated successfully.`,
      life: 3000,
    })

    emit('updated')

    visible.value = false
    reset()
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : 'Unable to update academic period.',
    )

    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: 'Unable to update the academic period.',
      life: 5000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <span
    class="cursor-pointer"
    @click="visible = true"
  >
    <slot>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        type="button"
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    header="Edit Academic Period"
    :style="{ width: '34rem' }"
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

        <InputText
          :model-value="academicYear.label"
          readonly
          disabled
          class="w-full"
        />
      </div>

      <!-- Period Order -->
      <div>
        <label
          class="mb-2 block text-sm font-medium
            text-surface-900 dark:text-surface-0"
        >
          Period Order
        </label>

        <InputText
          :model-value="String(period.sortOrder)"
          readonly
          disabled
          class="w-full"
        />

        <small
          class="mt-2 block text-surface-500
            dark:text-surface-400"
        >
          The period order cannot be changed after the period
          has been started.
        </small>
      </div>

      <!-- Period -->
      <div>
        <label
          for="academic-period-label"
          class="mb-2 block text-sm font-medium
            text-surface-900 dark:text-surface-0"
        >
          Period
        </label>

        <InputText
          id="academic-period-label"
          v-model="label"
          :placeholder="
            academicYear.periodScheme === 'semester'
              ? 'e.g. Semester 1'
              : 'e.g. Term 1'
          "
          class="w-full"
          :disabled="submitting"
          autofocus
        />

        <small
          v-if="label.trim() && duplicateLabel"
          class="mt-2 block text-red-500"
        >
          A period with this name already exists in this
          academic year.
        </small>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <!-- Begins -->
        <div>
          <label
            for="academic-period-begins"
            class="mb-2 block text-sm font-medium
              text-surface-900 dark:text-surface-0"
          >
            Begins
          </label>

          <DatePicker
            id="academic-period-begins"
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
            The start date must fall within
            {{ academicYear.label }}.
          </small>
        </div>

        <!-- Ends -->
        <div>
          <label
            for="academic-period-ends"
            class="mb-2 block text-sm font-medium
              text-surface-900 dark:text-surface-0"
          >
            Ends
          </label>

          <DatePicker
            id="academic-period-ends"
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
            The end date must fall within
            {{ academicYear.label }}.
          </small>
        </div>
      </div>

      <!-- Date order -->
      <small
        v-if="begins && ends && !datesOrderValid"
        class="block text-red-500"
      >
        The ending date must be after the beginning date.
      </small>

      <!-- Overlap -->
      <small
        v-if="begins && ends && overlapsSibling"
        class="block text-red-500"
      >
        This period overlaps another academic period.
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
          label="Update Period"
          icon="pi pi-check"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
</style>