<script setup lang="ts">
  import type { EventCardProps } from '~/types/event';

  defineProps<{data: EventCardProps}>()
</script>

<template>
  <div class="p-4"> 
    <div>
      <h2 class="font-bold text-xl max-w-full overflow-hidden">{{ data.title }}</h2>
      <div class="text-muted-color text-sm">{{ data.stats }}</div>
    </div>
    <div class="hidden">
      <Divider />
      <div class="text-xs text-muted-color">Total Votes</div>
      <div class="text-xl font-semibold">{{  }}</div>
    </div>
    <Divider />
    <div>
      <div class="flex gap-4 status-running">
        <Button class="bg-cv-slate text-cv-slate hover:bg-slate-300! dark:hover:bg-slate-500! border-cv-slate" fluid size="small" label="Analytics" @click="navigateTo({name: 'dash-event-analytics', params: {event: data.code}})" />
        <Button class="bg-primary hover:bg-emerald-400! dark:hover:bg-emerald-500!" fluid size="small" label="Manage" @click="navigateTo({name: 'dash-event', params: {event: data.code}})" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
