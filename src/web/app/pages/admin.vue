<script setup lang="ts">
  definePageMeta({
    middleware: ['dash-auth', 'admin-checker'],
    // middleware: ['dash-auth', 'admin-checker'],
    layout: 'admin-default',
  })
</script>

<template>
  <NuxtPage />
</template>

<style scoped></style>