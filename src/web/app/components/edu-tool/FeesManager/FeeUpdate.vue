<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface BreakdownItem {
  name: string
  amount: number | null
}

const props = defineProps<{
  fee: FeeSchedule
  period: AcademicPeriod
  schoolClass: SchoolClass
  accommodationType: 'day' | 'boarding'
}>()

const emit = defineEmits<{
  updated: []
}>()

const visible = ref(false)
const submitting = ref(false)

const amount = ref<number | null>(null)
const breakdown = ref<BreakdownItem[]>([])

const accessStore = useFeesManagerAccessStore()
const { access } = storeToRefs(accessStore)

const api = useAdoFetch()
const toast = useToast()

const accessId = computed(() => access.value?.access.id ?? null)

const accommodationLabel = computed(() =>
  props.accommodationType === 'day' ? 'Day' : 'Boarding',
)

/**
 * Fee schedules are stored in minor units.
 *
 * 30000 -> 300
 */
function toMajorUnits(value: number): number {
  return value / 100
}

/**
 * Form values are in major units.
 *
 * 300 -> 30000
 */
function toMinorUnits(value: number | null): number {
  if (value === null || !Number.isFinite(value)) {
    return 0
  }

  return Math.round(value * 100)
}

/**
 * Populate the form from the existing fee schedule.
 *
 * Persisted:
 * {
 *   tuition: 20000,
 *   feeding: 10000,
 * }
 *
 * Form:
 * [
 *   { name: 'tuition', amount: 200 },
 *   { name: 'feeding', amount: 100 },
 * ]
 */
function populateForm() {
  amount.value = toMajorUnits(props.fee.amount)

  breakdown.value = props.fee.breakdown
    ? Object.entries(props.fee.breakdown).map(([name, value]) => ({
        name,
        amount: toMajorUnits(value),
      }))
    : []
}

/**
 * Re-sync if the fee object itself changes while
 * the dialog is open.
 */
watch(
  () => props.fee,
  () => {
    if (visible.value) {
      populateForm()
    }
  },
  { deep: true },
)

function addBreakdownItem() {
  breakdown.value.push({
    name: '',
    amount: null,
  })
}

function removeBreakdownItem(index: number) {
  breakdown.value.splice(index, 1)
}

function clearBreakdown() {
  breakdown.value = []
}

const breakdownTotal = computed(() =>
  breakdown.value.reduce(
    (total, item) => total + (item.amount ?? 0),
    0,
  ),
)

const hasBreakdown = computed(() =>
  breakdown.value.length > 0,
)

const breakdownValid = computed(() => {
  if (!hasBreakdown.value) {
    return true
  }

  return breakdown.value.every(
    item =>
      item.name.trim().length > 0 &&
      item.amount !== null &&
      item.amount > 0,
  )
})

const breakdownMatchesAmount = computed(() => {
  if (!hasBreakdown.value || amount.value === null) {
    return true
  }

  return (
    Math.round(breakdownTotal.value * 100) ===
    Math.round(amount.value * 100)
  )
})

const canSubmit = computed(() => {
  return (
    !submitting.value &&
    amount.value !== null &&
    amount.value > 0 &&
    breakdownValid.value &&
    breakdownMatchesAmount.value &&
    accessId.value !== null
  )
})

function open() {
  populateForm()
  visible.value = true
}

function close() {
  if (submitting.value) {
    return
  }

  visible.value = false
}

async function submit() {
  if (!canSubmit.value || !accessId.value) {
    return
  }

  submitting.value = true

  try {
    const payload = {
      amount: toMinorUnits(amount.value),

      breakdown: hasBreakdown.value
        ? Object.fromEntries(
            breakdown.value.map(item => [
              item.name.trim(),
              toMinorUnits(item.amount),
            ]),
          )
        : null,
    }

    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/fee-schedules/${props.fee.id}`,
      {
        body: JSON.stringify(payload),
        query: {
          _method: 'PATCH',
        },
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to update fee',
        detail:
          result.message ??
          'Unable to update fee schedule.',
        life: 4000,
      })

      return
    }

    toast.add({
      severity: 'success',
      summary: 'Fee updated',
      detail:
        result.message ??
        'Fee schedule updated successfully.',
      life: 3000,
    })

    visible.value = false
    const dashboardStore = useFeesManagerDashboardStore()
    dashboardStore.refresh()

    emit('updated')
  } catch (error) {
    console.error(error)

    toast.add({
      severity: 'error',
      summary: 'Unable to update fee',
      detail:
        'Something went wrong while updating the fee schedule.',
      life: 4000,
    })
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <span @click="open">
    <slot />
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    :header="`Update ${accommodationLabel} Fee`"
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
        <div>
          <label
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Academic Period
          </label>

          <div
            class="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm dark:border-surface-700 dark:bg-surface-800"
          >
            {{ period.label }}
          </div>
        </div>

        <div>
          <label
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Class
          </label>

          <div
            class="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm dark:border-surface-700 dark:bg-surface-800"
          >
            {{ schoolClass.label }}
          </div>
        </div>

        <div class="sm:col-span-2">
          <label
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Accommodation
          </label>

          <div
            class="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm dark:border-surface-700 dark:bg-surface-800"
          >
            {{ accommodationLabel }}
          </div>
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
            <h3
              class="font-bold text-surface-900 dark:text-surface-0"
            >
              Breakdown
            </h3>

            <p class="mt-1 text-xs text-surface-500">
              Optional
            </p>
          </div>

          <!-- Always available -->
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
            class="flex items-center justify-between border-t border-surface-200 pt-4 dark:border-surface-800"
          >
            <span
              class="text-sm font-medium text-surface-500 dark:text-surface-400"
            >
              Breakdown total
            </span>

            <span
              class="font-bold text-surface-900 dark:text-surface-0"
            >
              {{
                new Intl.NumberFormat('en-GH', {
                  style: 'currency',
                  currency: 'GHS',
                }).format(breakdownTotal)
              }}
            </span>
          </div>

          <Message
            v-if="
              amount !== null &&
              !breakdownMatchesAmount
            "
            severity="warn"
            :closable="false"
            class="mt-3"
          >
            Breakdown total must equal the total fee.
          </Message>

          <Message
            v-else-if="!breakdownValid"
            severity="warn"
            :closable="false"
            class="mt-3"
          >
            Each breakdown item must have a name and
            an amount.
          </Message>
        </div>

        <div
          v-else
          class="rounded-xl border border-dashed border-surface-300 p-4 text-center text-sm text-surface-500 dark:border-surface-700"
        >
          No breakdown added. The total fee will be used
          as declared.
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
          label="Save Changes"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>