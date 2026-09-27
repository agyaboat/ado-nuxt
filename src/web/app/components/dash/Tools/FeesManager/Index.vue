<script setup lang="ts">
import type { ToolRuntime } from '~/stores/dash.tool_runtime'

const props = defineProps<{
  runtime: ToolRuntime | null
}>()

const route = useRoute()

const requiresSetup = computed(() => {
  return (
    props.runtime?.subscription.status === 'pending_setup' ||
    !props.runtime?.subscription.schoolId
  )
})

const currentView = computed(() => {
  return String(route.query.view || 'dashboard')
})

const viewComponentMap: Record<string, any> = {
  dashboard: resolveComponent('DashToolsFeesManagerDashboard'),
  fee_items: resolveComponent('DashToolsFeesManagerFeeItems'),
  fee_schedules: resolveComponent('DashToolsFeesManagerFeeSchedules'),
  students: resolveComponent('DashToolsFeesManagerStudents'),
  classes: resolveComponent('DashToolsFeesManagerClasses'),
  payments: resolveComponent('DashToolsFeesManagerPayments'),
  arrears: resolveComponent('DashToolsFeesManagerArrears'),
  reports: resolveComponent('DashToolsFeesManagerReports'),
  settings: resolveComponent('DashToolsFeesManagerSettings'),
}

const activeViewComponent = computed(() => {
  return viewComponentMap[currentView.value] || null
})
</script>

<template>
  <!-- <DashToolsFeesManagerSetup
    v-if="requiresSetup"
    :runtime="runtime"
  /> -->
  <DashToolsFeesManagerSetup
    v-if="false"
    :runtime="runtime"
  />

  <DashToolsFeesManagerLayout
    v-else
    :runtime="runtime"
    :active-view="currentView"
  >
    <component
      :is="activeViewComponent"
      v-if="activeViewComponent"
      :runtime="runtime"
    />

    <DashToolsFeesManagerViewNotFound
      v-else
      :runtime="runtime"
      :view="currentView"
    />
  </DashToolsFeesManagerLayout>
</template>