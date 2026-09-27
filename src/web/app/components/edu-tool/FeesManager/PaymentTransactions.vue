<script setup lang="ts">
import { computed, ref } from 'vue'

interface Transaction {
  id: string
  studentName: string
  reference: string
  amount: number
  status: 'pending' | 'successful' | 'failed' | 'reversed' | 'refunded'
  createdAt: Date
}

const transactions = ref<Transaction[]>([
  {
    id: 'txn-1',
    studentName: 'Ama Mensah',
    reference: 'TXN-10482',
    amount: 700,
    status: 'successful',
    createdAt: new Date('2026-09-09'),
  },
  {
    id: 'txn-2',
    studentName: 'Kofi Asare',
    reference: 'TXN-10481',
    amount: 1200,
    status: 'pending',
    createdAt: new Date('2026-09-09'),
  },
  {
    id: 'txn-3',
    studentName: 'Abena Owusu',
    reference: 'TXN-10480',
    amount: 350,
    status: 'failed',
    createdAt: new Date('2026-09-08'),
  },
])

const search = ref('')
const status = ref<string | null>(null)
const dateRange = ref<Date[] | null>(null)

const selectedTransaction = ref<Transaction | null>(null)
const previewVisible = ref(false)

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Successful', value: 'successful' },
  { label: 'Failed', value: 'failed' },
  { label: 'Reversed', value: 'reversed' },
  { label: 'Refunded', value: 'refunded' },
]

const filteredTransactions = computed(() => {
  const query = search.value.trim().toLowerCase()

  return transactions.value.filter((transaction) => {
    if (
      query &&
      !transaction.studentName.toLowerCase().includes(query)
    ) {
      return false
    }

    if (status.value && transaction.status !== status.value) {
      return false
    }

    if (dateRange.value?.[0]) {
      const from = startOfDay(dateRange.value[0])

      if (transaction.createdAt < from) {
        return false
      }
    }

    if (dateRange.value?.[1]) {
      const to = endOfDay(dateRange.value[1])

      if (transaction.createdAt > to) {
        return false
      }
    }

    return true
  })
})

function startOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function endOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

function clearFilters() {
  search.value = ''
  status.value = null
  dateRange.value = null
}

function openPreview(transaction: Transaction) {
  selectedTransaction.value = transaction
  previewVisible.value = true
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function statusSeverity(status: Transaction['status']) {
  switch (status) {
    case 'successful':
      return 'success'
    case 'pending':
      return 'info'
    case 'failed':
      return 'danger'
    case 'reversed':
    case 'refunded':
      return 'warn'
    default:
      return 'secondary'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div
      class="rounded-2xl border border-surface-200 bg-surface-0 p-4 shadow-sm
             dark:border-surface-700 dark:bg-surface-900"
    >
      <div class="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div class="md:col-span-5">
          <IconField>
            <InputIcon class="pi pi-search" />

            <InputText
              v-model="search"
              placeholder="Search student..."
              class="w-full"
            />
          </IconField>
        </div>

        <div class="md:col-span-3">
          <Select
            v-model="status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Status"
            show-clear
            class="w-full"
          />
        </div>

        <div class="md:col-span-3">
          <DatePicker
            v-model="dateRange"
            selection-mode="range"
            date-format="dd/mm/yy"
            placeholder="Date range"
            show-icon
            show-button-bar
            class="w-full"
          />
        </div>

        <div class="md:col-span-1">
          <Button
            label="Clear"
            severity="secondary"
            text
            class="w-full"
            :disabled="!search && !status && !dateRange"
            @click="clearFilters"
          />
        </div>
      </div>
    </div>

    <!-- Transactions -->
    <div
      class="overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 shadow-sm
             dark:border-surface-700 dark:bg-surface-900"
    >
      <DataTable
        :value="filteredTransactions"
        paginator
        :rows="10"
        :rows-per-page-options="[10, 25, 50]"
        removable-sort
        selection-mode="single"
        @row-click="openPreview($event.data)"
      >
        <Column field="studentName" header="Student" sortable />

        <Column field="reference" header="Transaction">
          <template #body="{ data }">
            <span class="font-medium">
              {{ data.reference }}
            </span>
          </template>
        </Column>

        <Column field="amount" header="Amount" sortable>
          <template #body="{ data }">
            <span class="font-bold">
              {{ formatAmount(data.amount) }}
            </span>
          </template>
        </Column>

        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <Tag
              :value="data.status"
              :severity="statusSeverity(data.status)"
            />
          </template>
        </Column>

        <Column field="createdAt" header="Date" sortable>
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>

        <Column header="" style="width: 4rem">
          <template #body>
            <i class="pi pi-chevron-right text-surface-400" />
          </template>
        </Column>

        <template #empty>
          <div class="py-12 text-center text-surface-500">
            No transactions found.
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Read-only preview -->
    <Dialog
      v-model:visible="previewVisible"
      modal
      header="Transaction Details"
      :style="{ width: '32rem' }"
    >
      <div
        v-if="selectedTransaction"
        class="space-y-5"
      >
        <div>
          <p class="text-sm text-surface-500">Student</p>
          <p class="mt-1 font-semibold">
            {{ selectedTransaction.studentName }}
          </p>
        </div>

        <div>
          <p class="text-sm text-surface-500">Transaction</p>
          <p class="mt-1 font-semibold">
            {{ selectedTransaction.reference }}
          </p>
        </div>

        <div>
          <p class="text-sm text-surface-500">Amount</p>
          <p class="mt-1 text-xl font-black">
            {{ formatAmount(selectedTransaction.amount) }}
          </p>
        </div>

        <div>
          <p class="text-sm text-surface-500">Status</p>
          <Tag
            class="mt-1"
            :value="selectedTransaction.status"
            :severity="statusSeverity(selectedTransaction.status)"
          />
        </div>

        <div>
          <p class="text-sm text-surface-500">Date</p>
          <p class="mt-1 font-medium">
            {{ formatDate(selectedTransaction.createdAt) }}
          </p>
        </div>
      </div>
    </Dialog>
  </div>
</template>