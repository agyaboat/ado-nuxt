<script setup lang="ts">
  import type { EventCardProps } from '~/types/event';

  defineProps<{data: EventCardProps}>()
</script>

<template>
  <div class="p-4">
    <div>
      <h2 class="font-bold text-xl max-w-full overflow-hidden">{{ data?.title }}</h2>
      <div class="text-muted-color text-sm">Ended {{  }} | 12 categories</div>
    </div>
    <div class="hidden">
      <Divider />
      <div class="text-xs text-muted-color">Total Votes</div>
      <div class="text-xl font-semibold">24,598</div>
    </div>
    <Divider />
    <div>
      <div class="flex status-ended">
        <Button class="bg-cv-slate text-cv-slate hover:bg-slate-300! dark:hover:bg-slate-500! border-cv-slate" fluid size="small" label="View Results" icon="pi pi-eye" @click="navigateTo({name: 'dash-event-analytics', params: {event: data.code}})" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
