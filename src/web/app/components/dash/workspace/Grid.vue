<script setup lang="ts">
import type { WorkspaceResource } from '~/stores/dash.workspace'

defineProps<{
  items: WorkspaceResource[]
}>()

const emit = defineEmits<{
  add: []
  open: [item: WorkspaceResource]
}>()
</script>

<template>
  <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <!-- <DashWorkspaceAddCard @add="emit('add')" /> -->

    <DashWorkspaceWCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      @open="emit('open', $event)"
    />
  </section>
</template>