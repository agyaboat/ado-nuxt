<script setup lang="ts">
definePageMeta({
  name: 'dash:tool-runtime',
})

const route = useRoute()
const store = useDashToolRuntimeStore()

const subscriptionId = computed(() => String(route.params.tool || ''))

const toolComponentMap: Record<string, any> = {
  fees_manager: resolveComponent('DashToolsFeesManager'),
  class_manager: resolveComponent('DashToolsClassManager'),
  attendance_manager: resolveComponent('DashToolsAttendanceManager'),
  subject_manager: resolveComponent('DashToolsSubjectManager'),
  staff_manager: resolveComponent('DashToolsStaffManager'),
}

const activeComponent = computed(() => {
  if (!store.toolKey) return null

  return toolComponentMap[store.toolKey] || null
})

onMounted(async () => {
  store.setCurrentToolSubscriptionId(subscriptionId.value)
  await store.getRuntime(subscriptionId.value)
})

watch(
  () => route.params.tool,
  async (value) => {
    const id = String(value || '')

    if (!id) return

    store.setCurrentToolSubscriptionId(id)
    await store.getRuntime(id)
  }
)
</script>

<template>
  <main class="w-full px-4 py-6 sm:px-6 lg:px-8">
    <Skeleton
      v-if="store.loading"
      height="20rem"
    />

    <DashToolNotFound
      v-else-if="store.notFound"
    />

    <Message
      v-else-if="store.fetchError"
      severity="error"
      :closable="false"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{{ store.fetchError }}</span>

        <Button
          label="Retry"
          icon="pi pi-refresh"
          size="small"
          severity="danger"
          outlined
          @click="store.getRuntime(subscriptionId)"
        />
      </div>
    </Message>

    <!-- <DashToolSetupScreen
      v-else-if="store.requiresSetup"
      :runtime="store.runtime"
    /> -->

    <component
      :is="activeComponent"
      v-else-if="activeComponent"
      :runtime="store.runtime"
    />

    <DashToolUndefined
      v-else-if="store.runtime"
      :runtime="store.runtime"
    />
  </main>
</template>