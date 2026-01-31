<script setup lang="ts">
import type { EventCardProps } from '~/types/event';

  // const props = defineProps<{data: {status: 'running'|'ended'|'draft'}}>()
const props = defineProps<{data: EventCardProps}>()
  const statusColor = (status: string) => {
    switch(status){
      case 'live':
        return 'bg-emerald-500'
      case 'draft':
        return 'bg-yellow-600'
      case 'ended':
        return 'bg-gray-600'
      case 'trashed':
        return 'bg-red-600'
      default:
        return 'blue'
    }
  }
</script>

<template>
  <div class="p-2">
    <div class="relative bg-white dark:bg-slate-900 rounded-lg overflow-hidden w-full max-w-sm mx-auto border border-cv-slate">
      <div class="select-none">
        <div class="z-20 absolute top-2 right-2 p-1 rounded-md w-20 flex items-center justify-center font-semibold text-white text-sm" :class="`${statusColor(data.status)}`">{{ data.status }}</div>
        <span v-if="data.type === 'award'" class="z-20 text-amber-300 border border-cv-amber rounded-md absolute top-2 left-2 material-symbols-outlined spin-y">trophy</span>
        <span v-else-if="data.type === 'pageantry'" class="z-20 text-emerald-300 border border-cv-emerald rounded-md absolute top-2 left-2 material-symbols-outlined spin-y">chess_queen</span>
      </div>
      <div class="w-full h-52 overflow-hidden group flex items-center justify-center bg-slate-900">
        <Image :src="data.logoUrl" width="100%" preview class="group-hover:scale-105 transition-transform ease-in" />
      </div>
      <div class="p-px bg-amber-500"></div>
      <div class="p-4">
        <DashEventsItemConRun v-if="data.status === 'live'" :data />
        <DashEventsItemConDraft v-else-if="data.status === 'draft'" :data />
        <DashEventsItemConEnd v-else-if="data.status === 'ended'" :data  />
        <DashEventsItemConTrash v-else-if="data.status === 'trashed'" :data />
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes spinY {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}

.spin-y {
  animation: spinY 2.5s linear infinite;
  transform-style: preserve-3d;
}
</style>
