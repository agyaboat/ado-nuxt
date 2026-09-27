<script setup lang="ts">
import type { ToolRuntime } from '~/stores/dash.tool_runtime'

defineProps<{
  runtime: ToolRuntime | null
}>()
</script>

<template>
  <section class="max-w-4xl">
    <Tag
      value="Setup required"
      severity="warn"
    />

    <h1 class="mt-4 text-3xl font-black text-surface-900 dark:text-surface-0">
      Set up Fees Manager
    </h1>

    <p class="mt-3 text-sm leading-6 text-surface-500 dark:text-surface-400">
      Complete the fee workspace details before using this tool.
    </p>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <Card>
        <template #content>
          <h3 class="font-bold text-surface-900 dark:text-surface-0">
            Workspace identity
          </h3>

          <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Name this Fees Manager workspace and connect it to a school or personal workspace.
          </p>
        </template>
      </Card>

      <Card>
        <template #content>
          <h3 class="font-bold text-surface-900 dark:text-surface-0">
            Academic period
          </h3>

          <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Select or create the academic period this fee workspace should operate in.
          </p>
        </template>
      </Card>

      <Card>
        <template #content>
          <h3 class="font-bold text-surface-900 dark:text-surface-0">
            Fee setup
          </h3>

          <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Add fee items, structures, and billing rules for this workspace.
          </p>
        </template>
      </Card>

      <Card>
        <template #content>
          <h3 class="font-bold text-surface-900 dark:text-surface-0">
            Payment settings
          </h3>

          <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Configure how payments, receipts, and balances should be handled.
          </p>
        </template>
      </Card>
    </div>

    <div class="mt-6 flex gap-3">
      <Button
        label="Start Fees Manager setup"
        icon="pi pi-arrow-right"
        icon-pos="right"
      />

      <Button
        label="Back to workspace"
        severity="secondary"
        outlined
        @click="navigateTo('/dash')"
      />
    </div>
  </section>
</template>