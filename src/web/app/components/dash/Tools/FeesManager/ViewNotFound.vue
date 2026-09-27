<script setup lang="ts">
import type { ToolRuntime } from '~/stores/dash.tool_runtime'

defineProps<{
  runtime: ToolRuntime | null
  view: string
}>()
</script>

<template>
  <Card>
    <template #content>
      <div class="py-12 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950">
          <i class="pi pi-exclamation-circle text-xl" />
        </div>

        <h2 class="mt-5 text-xl font-bold text-surface-900 dark:text-surface-0">
          View not found
        </h2>

        <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
          The view <code>{{ view }}</code> is not defined for {{ runtime?.tool.label }}.
        </p>

        <Button
          label="Go to dashboard"
          icon="pi pi-home"
          class="mt-6"
          @click="navigateTo({ query: { view: 'dashboard' } })"
        />
      </div>
    </template>
  </Card>
</template>