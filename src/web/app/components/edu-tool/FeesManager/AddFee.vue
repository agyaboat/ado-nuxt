<script setup lang="ts">
import { computed, ref } from 'vue'

interface BreakdownItem {
  name: string
  amount: number | null
}

interface Option {
  label: string
  value: string
}

const emit = defineEmits<{
  created: []
}>()

const route = useRoute()
const api = useAdoFetch()
const toast = useToast()

const academicYearsStore = useFeesManagerAcademicYearsStore()
const classesStore = useFeesManagerClassesStore()
const accessStore = useFeesManagerAccessStore()

const visible = ref(false)
const submitting = ref(false)

const academicPeriod = ref<string | null>(null)
const selectedClass = ref<string | null>(null)
const accommodation = ref<string | null>(null)
const amount = ref<number | null>(null)

const breakdown = ref<BreakdownItem[]>([])

const accessId = computed(() => String(route.params.access_id))

const academicPeriodOptions = computed<Option[]>(() => {
  return academicYearsStore.academicYears.flatMap((academicYear) => {
    return academicYear.periods.map((period) => ({
      label: `${academicYear.label} · ${period.label}`,
      value: period.id,
    }))
  })
})

const classOptions = computed<Option[]>(() => {
  return classesStore.classes.map((schoolClass) => ({
    label: schoolClass.label,
    value: schoolClass.id,
  }))
})

const accommodationOptions: Option[] = [
  {
    label: 'Day',
    value: 'day',
  },
  {
    label: 'Boarding',
    value: 'boarding',
  },
]

const breakdownTotal = computed(() =>
  breakdown.value.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0,
  ),
)

const hasBreakdown = computed(() => breakdown.value.length > 0)

const breakdownValid = computed(() => {
  if (!hasBreakdown.value) {
    return true
  }

  return breakdown.value.every(
    (item) =>
      item.name.trim().length > 0 &&
      item.amount !== null &&
      item.amount > 0,
  )
})

const breakdownMatchesAmount = computed(() => {
  if (!hasBreakdown.value || amount.value === null) {
    return true
  }

  return Math.round(breakdownTotal.value * 100) === Math.round(amount.value * 100)
})

const canSubmit = computed(() => {
  return (
    Boolean(academicPeriod.value) &&
    Boolean(selectedClass.value) &&
    Boolean(accommodation.value) &&
    amount.value !== null &&
    amount.value > 0 &&
    breakdownValid.value &&
    breakdownMatchesAmount.value
  )
})

async function loadOptions() {
  await Promise.all([
    academicYearsStore.check(accessId.value),
    classesStore.check(accessId.value),
  ])

  academicPeriod.value =
    accessStore.access?.school.currentAcademicPeriod?.id ?? null
}

async function open() {
  await loadOptions()

  visible.value = true
}

function addBreakdownItem() {
  breakdown.value.push({
    name: '',
    amount: null,
  })
}

function removeBreakdownItem(index: number) {
  breakdown.value.splice(index, 1)
}

function reset() {
  academicPeriod.value =
    accessStore.access?.school.currentAcademicPeriod?.id ?? null

  selectedClass.value = null
  accommodation.value = null
  amount.value = null
  breakdown.value = []
}

function close() {
  if (submitting.value) {
    return
  }

  visible.value = false
  reset()
}

async function submit() {
  if (!canSubmit.value || submitting.value) {
    return
  }

  submitting.value = true

  try {
    const payload = {
      academicPeriodId: academicPeriod.value,
      classId: selectedClass.value,
      accommodationType: accommodation.value,
      amount: Math.round(amount.value! * 100),
      breakdown: hasBreakdown.value
        ? Object.fromEntries(
            breakdown.value.map((item) => [
              item.name.trim(),
              Math.round(item.amount! * 100),
            ]),
          )
        : null,
    }

    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/fee-schedules`,
      {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to add fee',
        detail: result.message ?? 'Unable to add fee schedule.',
        life: 4000,
      })

      return
    }

    toast.add({
      severity: 'success',
      summary: 'Fee added',
      detail: result.message ?? 'Fee schedule added successfully.',
      life: 3000,
    })

    emit('created')

    visible.value = false
    reset()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Unable to add fee',
      detail: 'Something went wrong while adding the fee schedule.',
      life: 4000,
    })
  } finally {
    submitting.value = false
  }
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount)
}

defineExpose({
  open,
})
</script>

<template>
  <Button
    label="Add Fee"
    icon="pi pi-plus"
    type="button"
    @click="open"
  />

  <Dialog
    v-model:visible="visible"
    modal
    header="Add Fee"
    :style="{ width: '32rem' }"
    :closable="!submitting"
    :close-on-escape="!submitting"
  >
    <form
      class="space-y-6"
      @submit.prevent="submit"
    >
      <!-- Context -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Academic Period
          </label>

          <Select
            v-model="academicPeriod"
            :options="academicPeriodOptions"
            option-label="label"
            option-value="value"
            placeholder="Select academic period"
            class="w-full"
          />
        </div>

        <div>
          <label
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Class
          </label>

          <Select
            v-model="selectedClass"
            :options="classOptions"
            option-label="label"
            option-value="value"
            placeholder="Select class"
            class="w-full"
          />
        </div>

        <div>
          <label
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Accommodation
          </label>

          <Select
            v-model="accommodation"
            :options="accommodationOptions"
            option-label="label"
            option-value="value"
            placeholder="Select accommodation"
            class="w-full"
          />
        </div>
      </div>

      <!-- Amount -->
      <div>
        <label
          class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
        >
          Total Fee
        </label>

        <InputNumber
          v-model="amount"
          mode="currency"
          currency="GHS"
          locale="en-GH"
          :min="0"
          class="w-full"
          input-class="w-full"
        />
      </div>

      <!-- Breakdown -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-surface-900 dark:text-surface-0">
              Breakdown
            </h3>

            <p class="mt-1 text-xs text-surface-500">
              Optional
            </p>
          </div>

          <Button
            label="Add item"
            icon="pi pi-plus"
            type="button"
            severity="secondary"
            text
            size="small"
            @click="addBreakdownItem"
          />
        </div>

        <div
          v-if="hasBreakdown"
          class="space-y-3"
        >
          <div
            v-for="(item, index) in breakdown"
            :key="index"
            class="flex gap-2"
          >
            <InputText
              v-model="item.name"
              placeholder="e.g. Tuition"
              class="min-w-0 flex-1"
            />

            <InputNumber
              v-model="item.amount"
              mode="currency"
              currency="GHS"
              locale="en-GH"
              :min="0"
              class="w-36"
              input-class="w-full"
              placeholder="amount"
            />

            <Button
              icon="pi pi-trash"
              type="button"
              severity="danger"
              text
              rounded
              @click="removeBreakdownItem(index)"
            />
          </div>

          <div
            class="flex items-center justify-between border-t border-surface-200 pt-4
                   dark:border-surface-800"
          >
            <span
              class="text-sm font-medium text-surface-500 dark:text-surface-400"
            >
              Breakdown total
            </span>

            <span class="font-bold text-surface-900 dark:text-surface-0">
              {{ formatMoney(breakdownTotal) }}
            </span>
          </div>

          <Message
            v-if="amount !== null && !breakdownMatchesAmount"
            severity="warn"
            :closable="false"
            class="mt-3"
          >
            Breakdown total must equal the total fee.
          </Message>
        </div>

        <div
          v-else
          class="rounded-xl border border-dashed border-surface-300 p-4 text-center text-sm text-surface-500 dark:border-surface-700"
        >
          No breakdown added. The total fee will be used as declared.
        </div>
      </div>

      <!-- Actions -->
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
          label="Add Fee"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>