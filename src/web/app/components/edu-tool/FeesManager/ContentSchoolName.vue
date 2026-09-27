<script setup lang="ts">
const { access } = storeToRefs(useFeesManagerAccessStore())
</script>

<template>
  <p
    v-if="access?.school.name"
    class="mt-1 text-sm text-surface-500 dark:text-surface-400"
  >
    {{ access.school.name }}
  </p>
</template>