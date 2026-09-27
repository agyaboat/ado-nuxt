<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  fee: FeeSchedule
}>()

const emit = defineEmits<{
  updated: []
  deleted: []
}>()

const applicationState = computed(() => {
  const lastAppliedAt = props.fee.meta?.lastAppliedAt

  if (!lastAppliedAt) {
    return 'not_applied'
  }

  if (
    new Date(props.fee.updatedAt).getTime() >
    new Date(lastAppliedAt).getTime()
  ) {
    return 'changes_detected'
  }

  return 'applied'
})

const applicationStateLabel = computed(() => {
  if (applicationState.value === 'not_applied') {
    return 'Not applied'
  }

  if (applicationState.value === 'changes_detected') {
    return 'Changes detected'
  }

  return 'Fees applied'
})

const applicationStateSeverity = computed(() => {
  if (applicationState.value === 'not_applied') {
    return 'secondary'
  }

  if (applicationState.value === 'changes_detected') {
    return 'warn'
  }

  return 'success'
})

const hasBreakdown = computed(() => {
  return Boolean(
    props.fee.breakdown &&
      Object.keys(props.fee.breakdown).length,
  )
})

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p
            class="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-0"
          >
            {{ fee.class?.label || '—' }}
          </p>

          <div
            class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-surface-500"
          >
            <span>
              {{ fee.academicPeriod?.year?.label || '—' }}
              ·
              {{ fee.academicPeriod?.label || '—' }}
            </span>

            <span>·</span>

            <span class="capitalize">
              {{ fee.accommodationType }}
            </span>
          </div>
        </div>

        <Tag
          :value="fee.status"
          :severity="fee.status === 'active' ? 'success' : 'secondary'"
          class="capitalize"
        />
      </div>
    </div>

    <!-- Total + Application -->
    <div class="rounded-2xl border border-surface-200 p-5 dark:border-surface-800">
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-surface-500 dark:text-surface-400">
            Total Fee
          </p>

          <p
            class="mt-1 text-3xl font-black tracking-tight text-surface-900 dark:text-surface-0"
          >
            {{ formatMoney(fee.amount) }}
          </p>
        </div>

        <div class="text-right">
          <Tag
            :value="applicationStateLabel"
            :severity="applicationStateSeverity"
          />

          <p
            v-if="fee.meta?.lastAppliedAt"
            class="mt-2 text-xs text-surface-500"
          >
            Last applied {{ formatDate(fee.meta.lastAppliedAt) }}
          </p>
        </div>
      </div>

      <!-- Application action -->
      <div
        v-if="applicationState === 'not_applied'"
        class="mt-4 flex items-center justify-between border-t border-surface-200 pt-4 dark:border-surface-800"
      >
        <p class="text-sm text-surface-500">
          This fee has not yet been applied to students.
        </p>

        <EduToolFeesManagerFeeApply
          :fee="fee"
        >
          <template #default="{ apply, loading }">
            <Button
              label="Apply Now"
              icon="pi pi-check"
              size="small"
              type="button"
              :loading="loading"
              @click="apply"
            />
          </template>
        </EduToolFeesManagerFeeApply>
      </div>

      <div
        v-else-if="applicationState === 'changes_detected'"
        class="mt-4 flex items-center justify-between border-t border-surface-200 pt-4 dark:border-surface-800"
      >
        <p class="text-sm text-surface-500">
          The schedule has changed since it was last applied.
        </p>

        <Button
          label="Re-apply"
          icon="pi pi-refresh"
          size="small"
          type="button"
        />
      </div>
    </div>

    <!-- Breakdown -->
    <div>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-surface-900 dark:text-surface-0">
            Fee Breakdown
          </h3>

          <p class="mt-1 text-xs text-surface-500">
            {{ hasBreakdown ? 'Details included in this fee' : 'No breakdown provided' }}
          </p>
        </div>

        <span
          v-if="hasBreakdown"
          class="text-xs font-medium text-surface-500"
        >
          {{ Object.keys(fee.breakdown!).length }} items
        </span>
      </div>

      <div
        v-if="hasBreakdown"
        class="mt-3 overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800"
      >
        <div
          v-for="[item, itemAmount] in Object.entries(fee.breakdown!)"
          :key="item"
          class="flex items-center justify-between gap-4 border-b border-surface-200 px-4 py-3 last:border-b-0 dark:border-surface-800"
        >
          <span class="text-sm text-surface-600 dark:text-surface-300">
            {{ item }}
          </span>

          <span class="text-sm font-semibold text-surface-900 dark:text-surface-0">
            {{ formatMoney(itemAmount) }}
          </span>
        </div>

        <div
          class="flex items-center justify-between bg-surface-50 px-4 py-3 dark:bg-surface-800"
        >
          <span class="text-sm font-bold text-surface-900 dark:text-surface-0">
            Total
          </span>

          <span class="text-sm font-black text-surface-900 dark:text-surface-0">
            {{ formatMoney(fee.amount) }}
          </span>
        </div>
      </div>

      <div
        v-else
        class="mt-3 rounded-xl border border-dashed border-surface-300 p-4 text-center text-sm text-surface-500 dark:border-surface-700"
      >
        No fee breakdown provided.
      </div>
    </div>

    <!-- Actions -->
    <div
      class="flex items-center justify-between border-t border-surface-200 pt-5 dark:border-surface-800"
    >
      <EduToolFeesManagerFeeUpdate
        :fee="fee"
        @updated="emit('updated')"
      />

      <EduToolFeesManagerFeeDelete
        :fee="fee"
        @deleted="emit('deleted')"
      />
    </div>
  </div>
</template>