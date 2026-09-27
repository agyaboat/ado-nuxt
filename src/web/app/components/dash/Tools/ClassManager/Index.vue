<script setup lang="ts">
import type { ToolRuntime } from '~/stores/dash.tool_runtime'

defineProps<{
  runtime: ToolRuntime | null
}>()
</script>

<template>
  <div>
    <h1 class="text-3xl font-black text-surface-900 dark:text-surface-0">
      {{ runtime?.tool.label }}
    </h1>

    <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
      Class Manager runtime loaded successfully.
    </p>
  </div>
</template>