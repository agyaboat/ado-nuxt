<script setup lang="ts">
definePageMeta({
  name: 'fees_manager.reports'
})

interface Report {
  label: string
  description: string
  icon: string
  to: string
}

const reports: Report[] = [
  {
    label: 'Collection Report',
    description: 'Expected, collected and outstanding fees across the school.',
    icon: 'payments',
    to: '#',
  },
  {
    label: 'Outstanding Fees',
    description: 'Students with unpaid or partially paid fee balances.',
    icon: 'account_balance_wallet',
    to: '#',
  },
  {
    label: 'Student Fee Statements',
    description: 'View an individual student’s fee position and payments.',
    icon: 'description',
    to: '#',
  },
  {
    label: 'Payment Report',
    description: 'Payments received across the school by period and class.',
    icon: 'receipt_long',
    to: '#',
  },
]
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1
        class="text-3xl font-black tracking-tight text-surface-900 dark:text-surface-0"
      >
        Reports
      </h1>

      <EduToolFeesManagerContentSchoolName />
    </div>

    <div
      class="grid grid-cols-1 gap-5 lg:grid-cols-2"
    >
      <div
        v-for="report in reports"
        :key="report.label"
        class="group cursor-pointer rounded-2xl border border-surface-200 bg-surface-0 p-6
               shadow-sm transition-all duration-200
               hover:-translate-y-0.5 hover:border-surface-300 hover:shadow-md
               dark:border-surface-700 dark:bg-surface-900
               dark:hover:border-surface-600"
        @click="$router.push(report.to)"
      >
        <div class="flex items-start justify-between gap-6">
          <div class="flex min-w-0 items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                     bg-surface-100 text-surface-600
                     dark:bg-surface-800 dark:text-surface-300"
            >
              <i
                class="material-symbols-outlined text-2xl"
              >
                {{ report.icon }}
              </i>
            </div>

            <div>
              <h2
                class="text-lg font-bold text-surface-900
                       dark:text-surface-0"
              >
                {{ report.label }}
              </h2>

              <p
                class="mt-1 max-w-xl text-sm leading-6 text-surface-500
                       dark:text-surface-400"
              >
                {{ report.description }}
              </p>
            </div>
          </div>

          <i
            class="pi pi-chevron-right mt-1 shrink-0 text-surface-400
                   transition-transform duration-200
                   group-hover:translate-x-1"
          />
        </div>
      </div>
    </div>
  </div>
</template>