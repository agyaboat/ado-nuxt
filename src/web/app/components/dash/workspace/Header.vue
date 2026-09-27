<script setup lang="ts">
const emit = defineEmits<{
  add: []
}>()
</script>

<template>
  <section class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
        My workspace
      </h1>

      <p class="mt-2 max-w-2xl text-sm leading-6 text-surface-500 dark:text-surface-400">
        Access your subscribed tools from one place.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <Button
        label="Add tool"
        icon="pi pi-plus"
        severity="contrast"
        @click="emit('add')"
      />

      <Button
        icon="pi pi-ellipsis-h"
        severity="secondary"
        text
        rounded
        aria-label="More options"
      />
    </div>
  </section>
</template>