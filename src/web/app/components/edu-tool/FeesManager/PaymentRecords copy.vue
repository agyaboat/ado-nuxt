<script setup lang="ts">
import { ref } from 'vue'

interface PaymentRecord {
  id: string
  studentName: string
  admissionNumber: string
  fee: string
  amount: number
  mode: 'Online' | 'Manual'
  date: string
  reference: string
}

const search = ref('')
const academicPeriod = ref<string | null>(null)
const selectedClass = ref<string | null>(null)
const mode = ref<string | null>(null)

const selectedPayment = ref<PaymentRecord | null>(null)
const previewVisible = ref(false)

const academicPeriodOptions = [
  { label: '2026/2027 · Term 1', value: 'period-1' },
  { label: '2026/2027 · Term 2', value: 'period-2' },
]

const classOptions = [
  { label: 'SHS 1', value: 'class-1' },
  { label: 'SHS 2', value: 'class-2' },
  { label: 'SHS 3', value: 'class-3' },
]

const modeOptions = [
  { label: 'Online', value: 'Online' },
  { label: 'Manual', value: 'Manual' },
]

const payments = ref<PaymentRecord[]>([
  {
    id: 'payment-1',
    studentName: 'Ama Mensah',
    admissionNumber: 'STU-0012',
    fee: 'Term 1 Fees',
    amount: 700,
    mode: 'Online',
    date: 'Sep 8, 2026',
    reference: 'TXN-8F21',
  },
  {
    id: 'payment-2',
    studentName: 'Kofi Asare',
    admissionNumber: 'STU-0021',
    fee: 'Term 1 Fees',
    amount: 500,
    mode: 'Manual',
    date: 'Sep 7, 2026',
    reference: 'REC-1021',
  },
  {
    id: 'payment-3',
    studentName: 'Abena Owusu',
    admissionNumber: 'STU-0048',
    fee: 'Term 1 Fees',
    amount: 1000,
    mode: 'Online',
    date: 'Sep 6, 2026',
    reference: 'TXN-71AC',
  },
])

const filteredPayments = computed(() => {
  const query = search.value.trim().toLowerCase()

  return payments.value.filter((payment) => {
    const matchesSearch =
      !query ||
      payment.studentName.toLowerCase().includes(query) ||
      payment.admissionNumber.toLowerCase().includes(query) ||
      payment.reference.toLowerCase().includes(query)

    const matchesMode = !mode.value || payment.mode === mode.value

    return matchesSearch && matchesMode
  })
})

function clearFilters() {
  search.value = ''
  academicPeriod.value = null
  selectedClass.value = null
  mode.value = null
}

function openPayment(payment: PaymentRecord) {
  selectedPayment.value = payment
  previewVisible.value = true
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount)
}

function loadPayments() {
  // API call here
}
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="space-y-4">
      <EduToolFeesManagerRecordPayment />

      <details>
        <summary class="text-primary font-bold cursor-pointer">Filters</summary>
        <div class="flex flex-wrap gap-5">
          <IconField class="">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="search"
              placeholder="Search students or reference..."
            />
          </IconField>

          <Select
            v-model="academicPeriod"
            :options="academicPeriodOptions"
            option-label="label"
            option-value="value"
            placeholder="Academic period"
          />

          <Select
            v-model="selectedClass"
            :options="classOptions"
            option-label="label"
            option-value="value"
            placeholder="Class"
          />

          <Select
            v-model="mode"
            :options="modeOptions"
            option-label="label"
            option-value="value"
            placeholder="Mode"
          />

          <Button
            label="Clear"
            severity="secondary"
            text
            type="button"
            @click="clearFilters"
          />
        </div>
      </details>
    </div>

    <!-- Payments table -->
    <DataTable
      :value="filteredPayments"
      data-key="id"
      paginator
      :rows="10"
      :rows-per-page-options="[10, 25, 50]"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      current-page-report-template="{first}–{last} of {totalRecords}"
      row-hover
      striped-rows
      @row-click="({ data }) => openPayment(data)"
    >
      <Column header="Student">
        <template #body="{ data }">
          <div>
            <p class="font-semibold text-surface-900 dark:text-surface-0">
              {{ data.studentName }}
            </p>
            <p class="text-xs text-surface-500 dark:text-surface-400">
              {{ data.admissionNumber }}
            </p>
          </div>
        </template>
      </Column>

      <Column field="fee" header="Fee" />

      <Column header="Amount">
        <template #body="{ data }">
          <span class="font-semibold text-surface-900 dark:text-surface-0">
            {{ formatMoney(data.amount) }}
          </span>
        </template>
      </Column>

      <Column header="Mode">
        <template #body="{ data }">
          <Tag
            :value="data.mode"
            :severity="data.mode === 'Online' ? 'success' : 'secondary'"
          />
        </template>
      </Column>

      <Column field="date" header="Date" />

      <Column field="reference" header="Reference">
        <template #body="{ data }">
          <span class="font-mono text-sm text-surface-600 dark:text-surface-300">
            {{ data.reference }}
          </span>
        </template>
      </Column>
    </DataTable>

    <!-- Payment preview -->
    <Dialog
      v-model:visible="previewVisible"
      modal
      header="Payment"
      :style="{ width: '34rem' }"
    >
      <div v-if="selectedPayment" class="space-y-6">
        <div>
          <p class="text-lg font-bold text-surface-900 dark:text-surface-0">
            {{ selectedPayment.studentName }}
          </p>
          <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {{ selectedPayment.admissionNumber }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-5">
          <div>
            <p class="text-xs font-medium text-surface-500">Fee</p>
            <p class="mt-1 font-semibold">{{ selectedPayment.fee }}</p>
          </div>

          <div>
            <p class="text-xs font-medium text-surface-500">Amount</p>
            <p class="mt-1 font-semibold">
              {{ formatMoney(selectedPayment.amount) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-surface-500">Mode</p>
            <div class="mt-1">
              <Tag
                :value="selectedPayment.mode"
                :severity="selectedPayment.mode === 'Online' ? 'success' : 'secondary'"
              />
            </div>
          </div>

          <div>
            <p class="text-xs font-medium text-surface-500">Date</p>
            <p class="mt-1 font-semibold">{{ selectedPayment.date }}</p>
          </div>

          <div class="col-span-2">
            <p class="text-xs font-medium text-surface-500">Reference</p>
            <p class="mt-1 font-mono font-semibold">
              {{ selectedPayment.reference }}
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>