<script setup lang="ts">
import type { WorkspaceStats } from '~/stores/dash.workspace'

defineProps<{
  stats: WorkspaceStats
}>()
</script>

<template>
  <section class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
    <Card>
      <template #content>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-surface-500 dark:text-surface-400">
              Subscribed tools
            </p>

            <p class="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-0">
              {{ stats.tools }}
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950">
            <i class="pi pi-wrench" />
          </div>
        </div>
      </template>
    </Card>
  </section>
</template>