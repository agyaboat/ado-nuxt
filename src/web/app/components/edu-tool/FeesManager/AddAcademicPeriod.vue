<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  academicYear: AcademicYear
}>()

const emit = defineEmits<{
  created: []
}>()

const api = useAdoFetch()
const route = useRoute()
const toast = useToast()

const visible = ref(false)
const submitting = ref(false)

const label = ref('')
const sortOrder = ref<number | null>(null)
const begins = ref<Date | null>(null)
const ends = ref<Date | null>(null)

const accessId = computed(() => {
  return route.params.access_id as string
})

/*
|--------------------------------------------------------------------------
| Academic year
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
| Period limits
|--------------------------------------------------------------------------
*/

const periodLimit = computed(() => {
  return props.academicYear.periodScheme === 'semester'
    ? 2
    : 3
})

const periodCount = computed(() => {
  return props.academicYear.periods.length
})

const canAddPeriod = computed(() => {
  return periodCount.value < periodLimit.value
})

/*
|--------------------------------------------------------------------------
| Available period orders
|--------------------------------------------------------------------------
|
| We only remove orders that already exist.
|
| Trimester:
|   none       -> [1, 2, 3]
|   1          -> [2, 3]
|   2          -> [1, 3]
|   1, 2       -> [3]
|
| Semester:
|   none       -> [1, 2]
|   1          -> [2]
|   2          -> [1]
|
| This allows a school joining in Term 3 to start directly at 3.
*/

const availableOrders = computed<number[]>(() => {
  const usedOrders = new Set(
    props.academicYear.periods.map(
      (period) => period.sortOrder,
    ),
  )

  return Array.from(
    { length: periodLimit.value },
    (_, index) => index + 1,
  ).filter((order) => !usedOrders.has(order))
})

const orderValid = computed(() => {
  return (
    sortOrder.value !== null &&
    availableOrders.value.includes(sortOrder.value)
  )
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

  return props.academicYear.periods.some((period) => {
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
| Form
|--------------------------------------------------------------------------
*/

const canSubmit = computed(() => {
  return (
    canAddPeriod.value &&
    orderValid.value &&
    labelAvailable.value &&
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

function open() {
  reset()
  visible.value = true
}

function reset() {
  label.value = ''
  sortOrder.value = null
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
      `/edutools/fees_manager/${accessId.value}/academic-years/${props.academicYear.id}/periods`,
      {
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          label: label.value.trim(),
          sortOrder: sortOrder.value,
          startsAt: begins.value?.toISOString(),
          endsAt: ends.value?.toISOString(),
        }),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to start academic period',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })

      return
    }

    toast.add({
      severity: 'success',
      summary: 'Academic period started',
      detail: `${label.value.trim()} was started successfully.`,
      life: 3000,
    })

    emit('created')

    visible.value = false
    reset()
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : 'Unable to create academic period.',
    )

    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: 'Unable to start the academic period.',
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
        label="Start Academic Period"
        icon="pi pi-plus"
        type="button"
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    header="Start Academic Period"
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
          class="w-full"
          :placeholder="
            academicYear.periodScheme === 'semester'
              ? 'e.g. Semester 1'
              : 'e.g. Term 1'
          "
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

      <!-- Period Order -->
      <div>
        <label
          for="academic-period-order"
          class="mb-2 block text-sm font-medium
            text-surface-900 dark:text-surface-0"
        >
          Period Order
        </label>

        <Select
          id="academic-period-order"
          v-model="sortOrder"
          :options="availableOrders"
          placeholder="Select order"
          class="w-full"
          :disabled="submitting"
        />

        <small
          v-if="!availableOrders.length"
          class="mt-2 block text-red-500"
        >
          No period order is available for this academic year.
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
          label="Start Academic Period"
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