<script setup lang="ts">
definePageMeta({
  name: 'dash',
})

const store = useDashWorkspaceStore()

onMounted(() => {
  store.checkWorkspace()
})

function onAddTool() {
  navigateTo('/dash/tools-explorer')
}
</script>

<template>
  <div class="px-3 py-6 lg:px-8">
    <DashWorkspaceHeader @add="onAddTool" />

    <DashWorkspaceFilterBar
      :search="store.search"
      @update:search="store.setSearch"
    />

    <Message
      v-if="store.fetchError"
      severity="error"
      :closable="false"
      class="mb-6"
    >
      {{ store.fetchError }}
    </Message>

    <Skeleton
      v-if="store.loading"
      height="18rem"
    />

    <template v-else>
      <DashWorkspaceStats :stats="store.stats" />

      <DashWorkspaceGrid
        :items="store.filteredItems"
        @open=""
      />

      <DashWorkspaceEmptyState
        v-if="store.filteredItems.length === 0"
      />
    </template>
  </div>
</template>