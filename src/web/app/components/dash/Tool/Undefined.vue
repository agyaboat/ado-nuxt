<script setup lang="ts">
import type { ToolRuntime } from '~/stores/dash.tool_runtime'

defineProps<{
  runtime: ToolRuntime | null
}>()
</script>

<template>
  <Card>
    <template #content>
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950">
          <i class="pi pi-wrench text-xl" />
        </div>

        <h1 class="mt-5 text-2xl font-bold text-surface-900 dark:text-surface-0">
          Tool component not defined
        </h1>

        <p class="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          The tool <strong>{{ runtime?.tool.label }}</strong> exists, but no frontend component has been mapped for
          <code>{{ runtime?.tool.key }}</code>.
        </p>

        <Button
          label="Back to workspace"
          icon="pi pi-arrow-left"
          class="mt-6"
          @click="navigateTo('/dash')"
        />
      </div>
    </template>
  </Card>
</template>