<script setup lang="ts">
import type { ToolRuntime } from '~/stores/dash.tool_runtime'

const props = defineProps<{
  runtime: ToolRuntime | null
  activeView: string
}>()

const route = useRoute()

const views = [
  { label: 'Dashboard', value: 'dashboard', icon: 'pi pi-home' },
  { label: 'Fee Items', value: 'fee_items', icon: 'pi pi-list' },
  { label: 'Fee Schedules', value: 'fee_schedules', icon: 'pi pi-calendar' },
  { label: 'Students', value: 'students', icon: 'pi pi-users' },
  { label: 'Classes', value: 'classes', icon: 'pi pi-building' },
  { label: 'Payments', value: 'payments', icon: 'pi pi-wallet' },
  { label: 'Arrears', value: 'arrears', icon: 'pi pi-exclamation-circle' },
  { label: 'Reports', value: 'reports', icon: 'pi pi-chart-bar' },
  { label: 'Settings', value: 'settings', icon: 'pi pi-cog' },
]

function openView(view: string) {
  navigateTo({
    path: route.path,
    query: {
      ...route.query,
      view,
    },
  })
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-sm font-semibold text-surface-500 dark:text-surface-400">
          Tool workspace
        </p>

        <h1 class="text-3xl font-black text-surface-900 dark:text-surface-0">
          {{ runtime?.tool.label }}
        </h1>

        <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
          {{ runtime?.school?.name || runtime?.subscription.config?.workspace_name || 'Standalone workspace' }}
        </p>
      </div>

      <Button
        label="Back to workspace"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="navigateTo('/dash')"
      />
    </div>

    <div class="overflow-x-auto rounded-2xl border border-surface-200 bg-surface-0 p-2 dark:border-surface-700 dark:bg-surface-900">
      <div class="flex min-w-max gap-2">
        <Button
          v-for="view in views"
          :key="view.value"
          :label="view.label"
          :icon="view.icon"
          size="small"
          :severity="activeView === view.value ? 'contrast' : 'secondary'"
          :outlined="activeView !== view.value"
          @click="openView(view.value)"
        />
      </div>
    </div>

    <slot />
  </section>
</template>