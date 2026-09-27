<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

interface Option {
  label: string
  value: string
}

interface FeePaymentStudent {
  id: string
  name: string
  admissionNumber: string | null
}

interface FeePaymentClass {
  id: string
  label: string
}

interface FeePayment {
  id: string
  student: FeePaymentStudent
  class: FeePaymentClass | null
  amount: number
  mode: string
  paymentMethod: string | null
  paidAt: string
  reference: string | null
}

const route = useRoute()

const paymentsStore = useFeesManagerPaymentsStore()
const academicScheduleStore =
  useFeesManagerAcademicScheduleStore()
const classesStore = useFeesManagerClassesStore()

const accessId = computed(
  () => String(route.params.access_id)
)

/*
|--------------------------------------------------------------------------
| Filters
|--------------------------------------------------------------------------
*/

const search = ref('')
const academicPeriodId =
  ref<string | null>(null)
const classId = ref<string | null>(null)
const mode = ref<string | null>(null)
const date = ref<Date | null>(null)

/*
|--------------------------------------------------------------------------
| Payment allocation
|--------------------------------------------------------------------------
*/

const selectedPayment =
  ref<FeePayment | null>(null)

const allocationVisible = ref(false)

/*
|--------------------------------------------------------------------------
| Academic schedule
|--------------------------------------------------------------------------
|
| The schedule store keeps current and past academic
| years separately. Payment records need one flat list
| containing periods from both.
|
*/

const {
  currentAcademicYear,
  pastAcademicYears,
} = storeToRefs(academicScheduleStore)

const allAcademicYears = computed(() => {
  return [
    ...(currentAcademicYear.value
      ? [currentAcademicYear.value]
      : []),
    ...pastAcademicYears.value,
  ]
})

const academicPeriodOptions =
  computed<Option[]>(() => {
    return allAcademicYears.value.flatMap(
      (academicYear) =>
        academicYear.periods.map((period) => ({
          label: `${academicYear.label} · ${period.label}`,
          value: period.id,
        })),
    )
  })

/*
|--------------------------------------------------------------------------
| Classes
|--------------------------------------------------------------------------
*/

const classOptions = computed<Option[]>(() =>
  classesStore.classes.map((schoolClass) => ({
    label: schoolClass.label,
    value: schoolClass.id,
  })),
)

/*
|--------------------------------------------------------------------------
| Modes
|--------------------------------------------------------------------------
*/

const modeOptions: Option[] = [
  {
    label: 'Manual',
    value: 'manual',
  },
  {
    label: 'Online',
    value: 'online',
  },
]

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
}

function formatPaidAt(value: string) {
  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatDateFilter(
  value: Date | null,
) {
  if (!value) {
    return null
  }

  const year = value.getFullYear()
  const month = String(
    value.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    value.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/*
|--------------------------------------------------------------------------
| Query
|--------------------------------------------------------------------------
*/

function getQuery() {
  return {
    page:
      paymentsStore.meta.currentPage,
    limit:
      paymentsStore.meta.perPage,
    search:
      search.value.trim() || null,
    academicPeriodId:
      academicPeriodId.value,
    classId:
      classId.value,
    mode:
      mode.value,
    date:
      formatDateFilter(date.value),
  }
}

async function checkPayments(
  page = 1,
  limit = paymentsStore.meta.perPage,
) {
  await paymentsStore.check({
    ...getQuery(),
    page,
    limit,
  })
}

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

let searchTimer:
  | ReturnType<typeof setTimeout>
  | null = null

function searchPayments() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    checkPayments(1)
  }, 350)
}

/*
|--------------------------------------------------------------------------
| Filters
|--------------------------------------------------------------------------
*/

function clearFilters() {
  search.value = ''
  academicPeriodId.value = null
  classId.value = null
  mode.value = null
  date.value = null

  checkPayments(1)
}

/*
|--------------------------------------------------------------------------
| Payment allocation
|--------------------------------------------------------------------------
*/

function openPayment(
  payment: FeePayment,
) {
  selectedPayment.value = payment
  allocationVisible.value = true
}

function handleRowClick(event: {
  data: FeePayment
}) {
  openPayment(event.data)
}

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

function handlePageChange(event: {
  page: number
  rows: number
}) {
  checkPayments(
    event.page + 1,
    event.rows,
  )
}

/*
|--------------------------------------------------------------------------
| Payment created
|--------------------------------------------------------------------------
*/

async function handlePaymentCreated() {
  await paymentsStore.fetchPayments({
    page: 1,
    limit: paymentsStore.meta.perPage,
    search:
      search.value.trim() || null,
    academicPeriodId:
      academicPeriodId.value,
    classId:
      classId.value,
    mode:
      mode.value,
    date:
      formatDateFilter(date.value),
  })
}

/*
|--------------------------------------------------------------------------
| Initialization
|--------------------------------------------------------------------------
*/

async function initialize() {
  paymentsStore.initialize(accessId.value)

  await Promise.all([
    academicScheduleStore.check(
      accessId.value,
    ),

    classesStore.check(
      accessId.value,
    ),

    checkPayments(1),
  ])
}

/*
|--------------------------------------------------------------------------
| Watchers
|--------------------------------------------------------------------------
*/

onMounted(initialize)

watch(
  search,
  searchPayments,
)

watch(
  [
    academicPeriodId,
    classId,
    mode,
    date,
  ],
  () => {
    checkPayments(1)
  },
)

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

defineExpose({
  refresh:
    handlePaymentCreated,
})
</script>

<template>
  <div class="space-y-5">
    <!-- Record payment -->
    <div class="flex justify-end">
      <EduToolFeesManagerRecordPayment @created="paymentsStore.refresh()" />
    </div>

    <!-- Filters -->
    <div
      class="rounded-2xl border border-surface-200 bg-surface-50 px-2 py-1
        dark:border-surface-800 dark:bg-surface-900"
    >
      <details class="mb-4">
        <summary
          class="cursor-pointer font-bold text-primary"
        >
          Filters
        </summary>

        <div class="flex flex-wrap gap-4">
          <!-- Search -->
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-search" />
            </InputGroupAddon>

            <InputText
              v-model="search"
              placeholder="Search students or reference"
            />
          </InputGroup>

          <!-- Academic Period -->
          <Select
            v-model="academicPeriodId"
            :options="academicPeriodOptions"
            option-label="label"
            option-value="value"
            placeholder="Academic period"
            show-clear
          />

          <!-- Class -->
          <Select
            v-model="classId"
            :options="classOptions"
            option-label="label"
            option-value="value"
            placeholder="Class"
            show-clear
          />

          <!-- Mode -->
          <Select
            v-if="false"
            v-model="mode"
            :options="modeOptions"
            option-label="label"
            option-value="value"
            placeholder="Mode"
            show-clear
          />

          <!-- Date -->
          <DatePicker
            v-model="date"
            placeholder="Date"
            date-format="dd/mm/yy"
            show-clear
          />

          <!-- Clear -->
          <Button
            label="Clear"
            text
            severity="secondary"
            type="button"
            @click="clearFilters"
          />
        </div>
      </details>
    </div>

    <!-- Payments Table -->
    <div
      class="overflow-hidden rounded-2xl border border-surface-200
        bg-surface-0 shadow-sm
        dark:border-surface-800 dark:bg-surface-900"
    >
      <DataTable
        :value="paymentsStore.payments"
        :loading="paymentsStore.loading"
        data-key="id"
        row-hover
        class="cursor-pointer"
        :rows-per-page-options="[10, 25, 50]"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} of {totalRecords}"
        @row-click="handleRowClick"
        table-style="minWidth: 50rem"
      >
        <!-- Student -->
        <Column header="Student">
          <template #body="{ data }">
            <div>
              <p class="font-semibold">
                {{ data.student.name }}
              </p>

              <p
                class="text-xs text-surface-500"
              >
                {{
                  data.student.admissionNumber ??
                  '—'
                }}
              </p>
            </div>
          </template>
        </Column>

        <!-- Class -->
        <Column header="Class">
          <template #body="{ data }">
            {{
              data.class?.label ?? '—'
            }}
          </template>
        </Column>

        <!-- Amount -->
        <Column
          field="amount"
          header="Amount"
        >
          <template #body="{ data }">
            <span class="font-semibold">
              {{ formatMoney(data.amount) }}
            </span>
          </template>
        </Column>

        <!-- Mode -->
        <!-- <Column
          field="mode"
          header="Mode"
        >
          <template #body="{ data }">
            <Tag
              :value="data.mode"
              severity="secondary"
            />
          </template>
        </Column> -->

        <!-- Date -->
        <Column
          field="paidAt"
          header="Date"
        >
          <template #body="{ data }">
            {{ formatPaidAt(data.paidAt) }}
          </template>
        </Column>

        <!-- Reference -->
        <Column
          field="reference"
          header="Reference"
        >
          <template #body="{ data }">
            <span class="font-medium">
              {{
                data.reference ?? '—'
              }}
            </span>
          </template>
        </Column>

        <template #empty>
          <div
            class="py-12 text-center text-surface-500"
          >
            No payments found.
          </div>
        </template>
      </DataTable>

      <!-- Pagination -->
      <Paginator
        v-if="paymentsStore.meta.total > 0"
        :first="
          (paymentsStore.meta.currentPage - 1) *
          paymentsStore.meta.perPage
        "
        :rows="paymentsStore.meta.perPage"
        :total-records="paymentsStore.meta.total"
        :rows-per-page-options="[10, 20, 50]"
        @page="handlePageChange"
      />
    </div>

    <!-- Payment Allocation -->
    <EduToolFeesManagerPaymentAllocationBreakdown
      v-if="selectedPayment"
      v-model:visible="
        allocationVisible
      "
      :payment="selectedPayment"
    />
  </div>
</template>