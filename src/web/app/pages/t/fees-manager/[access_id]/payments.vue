<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({
  name: 'fees_manager.payments'
})
type View = 'records' | 'transactions'

const activeView = ref<View>('records')

const pageTitle = computed(() =>
  activeView.value === 'records'
    ? 'Payment Records'
    : 'Transaction Records'
)

function switchView(view: View) {
  activeView.value = view
}
</script>

<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-surface-900 dark:text-surface-0">
          {{ pageTitle }}
        </h1>

        <EduToolFeesManagerContentSchoolName />
      </div>

      <!-- View switcher -->
      <div class="flex rounded-xl bg-surface-100 p-1 dark:bg-surface-800" v-if="false">
        <Button
          label="Records"
          type="button"
          text
          :class="[
            'rounded-lg!',
            activeView === 'records'
              ? 'bg-surface-0! text-surface-900! shadow-sm dark:bg-surface-700! dark:text-surface-0!'
              : 'text-surface-500! dark:text-surface-400!',
          ]"
          @click="switchView('records')"
        />

        <Button
          label="Transactions"
          type="button"
          text
          :class="[
            'rounded-lg!',
            activeView === 'transactions'
              ? 'bg-surface-0! text-surface-900! shadow-sm dark:bg-surface-700! dark:text-surface-0!'
              : 'text-surface-500! dark:text-surface-400!',
          ]"
          @click="switchView('transactions')"
        />
      </div>
    </div>

    <!-- Active view -->
    <EduToolFeesManagerPaymentRecords
      v-if="activeView === 'records'"
    />

    <EduToolFeesManagerPaymentTransactions
      v-else
    />
  </div>
</template>