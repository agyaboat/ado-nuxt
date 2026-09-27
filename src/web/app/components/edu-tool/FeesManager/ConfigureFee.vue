<script setup lang="ts">
import { computed, ref } from 'vue'

interface AcademicPeriod {
  id: string
  label: string
  startsAt: string
  endsAt: string
  sortOrder: number
}

interface SchoolClass {
  id: string
  label: string
}

type AccommodationType = 'day' | 'boarding'

interface BreakdownItem {
  name: string
  amount: number | null
}

const props = defineProps<{
  period: AcademicPeriod
  schoolClass: SchoolClass
  accommodationType: AccommodationType
}>()

const emit = defineEmits<{
  created: []
}>()

const route = useRoute()
const api = useAdoFetch()
const toast = useToast()

const visible = ref(false)
const submitting = ref(false)

const amount = ref<number | null>(null)

const breakdown = ref<BreakdownItem[]>([])

const accessId = computed(() => {
  return String(route.params.access_id)
})

/*
|--------------------------------------------------------------------------
| Accommodation
|--------------------------------------------------------------------------
*/

const accommodationLabel = computed(() => {
  return props.accommodationType === 'day'
    ? 'Day'
    : 'Boarding'
})

/*
|--------------------------------------------------------------------------
| Breakdown
|--------------------------------------------------------------------------
*/

const hasBreakdown = computed(() => {
  return breakdown.value.length > 0
})

const breakdownTotal = computed(() => {
  return breakdown.value.reduce(
    (total, item) =>
      total + (Number(item.amount) || 0),
    0,
  )
})

const breakdownValid = computed(() => {
  if (!hasBreakdown.value) {
    return true
  }

  return breakdown.value.every((item) => {
    return (
      item.name.trim().length > 0 &&
      item.amount !== null &&
      item.amount > 0
    )
  })
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

/*
|--------------------------------------------------------------------------
| Form
|--------------------------------------------------------------------------
*/

const canSubmit = computed(() => {
  return (
    amount.value !== null &&
    amount.value > 0 &&
    breakdownValid.value &&
    breakdownMatchesAmount.value
  )
})

/*
|--------------------------------------------------------------------------
| Breakdown actions
|--------------------------------------------------------------------------
*/

function addBreakdownItem() {
  breakdown.value.push({
    name: '',
    amount: null,
  })
}

function removeBreakdownItem(index: number) {
  breakdown.value.splice(index, 1)
}

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
    const payload = {
      academicPeriodId: props.period.id,
      classId: props.schoolClass.id,
      accommodationType: props.accommodationType,
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to configure fee',
        detail:
          result.message ??
          'Unable to configure the fee schedule.',
        life: 4000,
      })

      return
    }

    toast.add({
      severity: 'success',
      summary: 'Fee configured',
      detail:
        result.message ??
        `${props.schoolClass.label} ${accommodationLabel.value.toLowerCase()} fee configured successfully.`,
      life: 3000,
    })

    emit('created')
    const dashboardStore = useFeesManagerDashboardStore()
    dashboardStore.refresh()


    visible.value = false
    reset()
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : 'Unable to configure fee schedule.',
    )

    toast.add({
      severity: 'error',
      summary: 'Unable to configure fee',
      detail:
        'Something went wrong while configuring the fee schedule.',
      life: 4000,
    })
  } finally {
    submitting.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Display
|--------------------------------------------------------------------------
*/

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
  <span
    class="cursor-pointer"
    @click="open"
  >
    <slot>
      <Button
        label="Add Fee"
        icon="pi pi-plus"
        type="button"
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    header="Configure Fee"
    :style="{ width: '32rem' }"
    :closable="!submitting"
    :close-on-escape="!submitting"
  >
    <form
      class="space-y-6"
      @submit.prevent="submit"
    >
      <!-- Context -->
      <div
        class="rounded-xl border border-surface-200
          bg-surface-50 p-4
          dark:border-surface-700
          dark:bg-surface-900"
      >
        <div class="grid gap-4 sm:grid-cols-3">
          <!-- Period -->
          <div>
            <p
              class="text-xs font-medium uppercase
                tracking-wide text-surface-500"
            >
              Period
            </p>

            <p
              class="mt-1 font-semibold
                text-surface-900 dark:text-surface-0"
            >
              {{ period.label }}
            </p>
          </div>

          <!-- Class -->
          <div>
            <p
              class="text-xs font-medium uppercase
                tracking-wide text-surface-500"
            >
              Class
            </p>

            <p
              class="mt-1 font-semibold
                text-surface-900 dark:text-surface-0"
            >
              {{ schoolClass.label }}
            </p>
          </div>

          <!-- Accommodation -->
          <div>
            <p
              class="text-xs font-medium uppercase
                tracking-wide text-surface-500"
            >
              Accommodation
            </p>

            <p
              class="mt-1 font-semibold
                text-surface-900 dark:text-surface-0"
            >
              {{ accommodationLabel }}
            </p>
          </div>
        </div>
      </div>

      <!-- Total Fee -->
      <div>
        <label
          for="fee-amount"
          class="mb-2 block text-sm font-semibold
            text-surface-700 dark:text-surface-200"
        >
          Total Fee
        </label>

        <InputNumber
          id="fee-amount"
          v-model="amount"
          mode="currency"
          currency="GHS"
          locale="en-GH"
          :min="0"
          class="w-full"
          input-class="w-full"
          :disabled="submitting"
          autofocus
        />
      </div>

      <!-- Breakdown -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h3
              class="font-bold text-surface-900
                dark:text-surface-0"
            >
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
            :disabled="submitting"
            @click="addBreakdownItem"
          />
        </div>

        <!-- Breakdown items -->
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
              :disabled="submitting"
            />

            <InputNumber
              v-model="item.amount"
              mode="currency"
              currency="GHS"
              locale="en-GH"
              :min="0"
              class="w-36"
              input-class="w-full"
              placeholder="Amount"
              :disabled="submitting"
            />

            <Button
              icon="pi pi-trash"
              type="button"
              severity="danger"
              text
              rounded
              :disabled="submitting"
              @click="removeBreakdownItem(index)"
            />
          </div>

          <!-- Breakdown total -->
          <div
            class="flex items-center justify-between
              border-t border-surface-200 pt-4
              dark:border-surface-800"
          >
            <span
              class="text-sm font-medium text-surface-500
                dark:text-surface-400"
            >
              Breakdown total
            </span>

            <span
              class="font-bold text-surface-900
                dark:text-surface-0"
            >
              {{ formatMoney(breakdownTotal) }}
            </span>
          </div>

          <Message
            v-if="
              amount !== null &&
              !breakdownMatchesAmount
            "
            severity="warn"
            :closable="false"
          >
            Breakdown total must equal the total fee.
          </Message>
        </div>

        <!-- No breakdown -->
        <div
          v-else
          class="rounded-xl border border-dashed
            border-surface-300 p-4 text-center
            text-sm text-surface-500
            dark:border-surface-700"
        >
          No breakdown added. The total fee will be used
          as declared.
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex justify-end gap-2 border-t
          border-surface-200 pt-5
          dark:border-surface-800"
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
          label="Configure Fee"
          type="submit"
          icon="pi pi-check"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
</style>