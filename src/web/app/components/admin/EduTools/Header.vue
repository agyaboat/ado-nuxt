<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  create: []
  refresh: []
}>()
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <p class="text-sm text-muted-color font-semibold">
        Platform Admin
      </p>

      <h1 class="text-2xl md:text-3xl font-black">
        Tools Registry
      </h1>

      <p class="text-muted-color mt-1 max-w-2xl">
        Register, configure, activate, deprecate, and manage ScholarSaaS tools.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="emit('refresh')"
      />

      <Button
        label="Register Tool"
        icon="pi pi-plus"
        @click="emit('create')"
      />
    </div>
  </div>
</template>