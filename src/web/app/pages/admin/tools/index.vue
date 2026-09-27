<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
})

const store = useAdminEduToolsStore()

const dialogVisible = ref(false)
const editingToolId = ref<string | null>(null)

const editingTool = computed(() => {
  if (!editingToolId.value) return null
  return store.tools.find((tool) => tool.id === editingToolId.value) || null
})

function openCreateDialog() {
  editingToolId.value = null
  dialogVisible.value = true
}

function openEditDialog(id: string) {
  editingToolId.value = id
  dialogVisible.value = true
}

onMounted(() => {
  store.checkTools()
})

</script>

<template>
  <section class="space-y-6">
    <AdminEduToolsHeader
      :loading="store.loading"
      @create="openCreateDialog"
      @refresh="store.refreshTools"
    />

    <AdminEduToolsStats
      :total="store.totalTools"
      :active="store.activeToolsCount"
      :market-visible="store.marketVisibleToolsCount"
      :deprecated="store.deprecatedToolsCount"
    />

    <AdminEduToolsTable
      :tools="store.tools"
      :loading="store.loading"
      :saving="store.saving"
      :deleting="store.deleting"
      @edit="openEditDialog"
      @status="store.updateToolStatus"
      @delete="store.deleteTool"
    />

    <AdminEduToolsFormDialog
      v-model:visible="dialogVisible"
      :tool="editingTool"
      :saving="store.saving"
      @create="store.createTool"
      @update="store.updateTool"
    />
  </section>
</template>