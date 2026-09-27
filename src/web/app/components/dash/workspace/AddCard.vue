<script setup lang="ts">
const emit = defineEmits<{
  add: []
}>()
</script>

<template>
  <Card
    class="cursor-pointer border border-dashed border-surface-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-surface-700"
    @click="emit('add')"
  >
    <template #content>
      <div class="flex min-h-52 flex-col items-center justify-center text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-300">
          <i class="pi pi-plus text-xl" />
        </div>

        <h3 class="mt-5 text-base font-semibold text-surface-800 dark:text-surface-0">
          Add workspace
        </h3>

        <p class="mt-2 max-w-xs text-sm leading-6 text-surface-500 dark:text-surface-400">
          Connect a school account or subscribe to a tool.
        </p>
      </div>
    </template>
  </Card>
</template>