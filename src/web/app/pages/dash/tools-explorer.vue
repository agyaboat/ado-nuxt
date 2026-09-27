<script setup lang="ts">
definePageMeta({
  name: 'dash:tools-explorer',
})

const store = useDashToolsExplorerStore()

onMounted(() => {
  store.checkTools()
})
</script>

<template>
  <main class="w-full">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashToolsExplorerHeader
        :search="store.search"
        @update:search="store.setSearch"
      />

      <Divider class="my-6" />

      <DashToolsExplorerFilters
        :categories="store.categories"
        :selected-category="store.selectedCategory"
        @update:selected-category="store.setCategory"
      />

      <Message
        v-if="store.fetchError"
        severity="error"
        :closable="false"
        class="mt-6"
      >
        {{ store.fetchError }}
      </Message>

      <Skeleton
        v-if="store.loading"
        height="20rem"
        class="mt-6"
      />

      <template v-else>
        <section
          v-if="store.visibleTools.length"
          class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          <DashToolsExplorerToolCard
            v-for="tool in store.visibleTools"
            :key="tool.id"
            :tool="tool"
          />
        </section>

        <DashToolsExplorerEmptyState
          v-else
          class="mt-6"
        />
      </template>
    </div>
  </main>
</template>