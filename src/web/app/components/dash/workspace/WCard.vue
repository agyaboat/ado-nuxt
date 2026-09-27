<script setup lang="ts">
import type { WorkspaceResource } from '~/stores/dash.workspace'

const props = defineProps<{
  item: WorkspaceResource
}>()

const emit = defineEmits<{
  open: [item: WorkspaceResource]
}>()

const itemIcon = computed(() => {
  return props.item.resourceType === 'suite'
    ? 'pi pi-building'
    : 'pi pi-wrench'
})

function openR(item: WorkspaceResource) {
  if (item.resourceType === 'tool' && item.meta.key) {
    return navigateTo({name: item.meta.key, params: {access_id: item.meta.accessId}})
  }
  alert('Working on this.. WCard')
}
</script>

<template>
  <Card
    class="h-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    @click="emit('open', item)"
  >
    <template #content>
      <div class="flex min-h-52 flex-col">
        <div class="flex items-start justify-between gap-4">
          <Avatar
            v-if="item.image"
            :image="item.image"
            shape="square"
            size="large"
            class="rounded-xl"
          />

          <Avatar
            v-else
            :icon="itemIcon"
            shape="square"
            size="large"
            class="rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950"
          />
        </div>

        <div class="mt-6">
          <h3
            class="text-xl font-black tracking-tight text-surface-950 dark:text-surface-0"
          >
            {{ item.label }}
          </h3>

          <p
            v-if="item.sublabel"
            class="mt-1 text-sm font-medium text-surface-600 dark:text-surface-300"
          >
            @{{ item.sublabel }}
          </p>

          <p
            v-if="item.description"
            class="mt-2 line-clamp-3 text-sm leading-6 text-surface-500 dark:text-surface-400"
          >
            {{ item.description }}
          </p>
        </div>

        <div class="mt-auto pt-6">
          <Button
            label="Open"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="w-full"
            @click.stop="openR(item)"
          />
        </div>
      </div>
    </template>
  </Card>
</template>