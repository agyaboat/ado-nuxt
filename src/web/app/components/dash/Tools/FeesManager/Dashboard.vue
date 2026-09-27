<script setup lang="ts">
import type { ToolRuntime } from '~/stores/dash.tool_runtime'

defineProps<{
  runtime: ToolRuntime | null
}>()
</script>

<template>
  <section class="grid gap-4 md:grid-cols-3">
    <Card>
      <template #content>
        <p class="text-sm text-surface-500">Expected fees</p>
        <p class="mt-2 text-3xl font-black">0</p>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="text-sm text-surface-500">Collected</p>
        <p class="mt-2 text-3xl font-black">0</p>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="text-sm text-surface-500">Outstanding</p>
        <p class="mt-2 text-3xl font-black">0</p>
      </template>
    </Card>
  </section>
</template>