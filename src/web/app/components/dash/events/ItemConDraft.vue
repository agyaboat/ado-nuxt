<script setup lang="ts">
import type { EventCardProps } from '~/types/event/';

  const props = defineProps<{data: EventCardProps}>()

  const progressColor = (progress: number)=>{
    if(progress >= 100) return 'bg-emerald-400 dark:bg-emerald-300'
    else if(progress < 50) return 'bg-red-400 dark:bg-red-300'
    else return 'bg-amber-400 dark:bg-amber-300'
  }
</script>

<template>
  <div class="p-4">
    <div>
      <h2 class="font-bold text-xl max-w-full overflow-hidden">{{ data.title }}</h2>
      <div class="text-muted-color text-sm">Created {{ timeAgo(data.createdAt) }} | Not Launched</div>
    </div>
    <div class="hidden">
      <Divider />
      <div class="text-muted-color mb-2 flex">Setup Progress</div>
      <ProgressBar :value="30" class="h-2" :pt="{value: {class: progressColor(30)}}" :show-value="false" />
    </div>
    <Divider />
    <div class="flex status">
      <Button class="bg-cv-amber text-cv-amber hover:bg-amber-300/30! dark:hover:bg-amber-500/30! border-cv-amber" fluid size="small" label="Continue Setup" icon="pi pi-pencil" @click="navigateTo({name: 'dash-event', params: {event: data.code}})" />
    </div>
  </div>
</template>

<style scoped></style>
