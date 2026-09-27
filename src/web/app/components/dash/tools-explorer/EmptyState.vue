<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 px-6 py-16 text-center dark:border-surface-700"
  >
    <div
      class="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-300"
    >
      <i class="pi pi-search text-xl" />
    </div>

    <h3
      class="mt-5 text-lg font-semibold text-surface-900 dark:text-surface-0"
    >
      {{ title || 'No tools found' }}
    </h3>

    <p
      class="mt-2 max-w-md text-sm leading-6 text-surface-500 dark:text-surface-400"
    >
      {{ message || 'Try another search or category.' }}
    </p>
  </div>
</template>