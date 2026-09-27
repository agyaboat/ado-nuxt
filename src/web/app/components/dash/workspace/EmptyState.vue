<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
}>()
</script>

<template>
  <Card class="mt-6">
    <template #content>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-300">
          <i class="pi pi-search text-xl" />
        </div>

        <h3 class="mt-5 text-lg font-semibold text-surface-900 dark:text-surface-0">
          {{ title || 'No workspace found' }}
        </h3>

        <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
          {{ message || 'Try another filter or search term.' }}
        </p>
      </div>
    </template>
  </Card>
</template>