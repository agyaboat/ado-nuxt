<script setup lang="ts">
  const data = {
    live: 4, 
    draft: 2,
    ended: 3,
  }

  const getIcon = (status: string) => {
    switch(status){
      case 'live':
        return {icon: 'online_prediction', color: 'emerald'}
      case 'draft':
        return {icon: 'draft', color: 'blue'}
        // return 'draft'
      case 'ended':
        return {icon: 'stop_circle', color: 'red'}

      case 'trashed':
        return {icon: 'delete', color: 'red'}
        // return 'stop_circle'
      default:
        return {icon: 'globe', color: 'purple'}
        // return 'globe'
    }
  }

  const {breakdown, checkData} = useEventsBreakdownStore()
  onMounted(()=>{
    checkData()
  })
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

    <CVCard v-for="[status, count] in Object.entries(breakdown.list)" class="rounded-xl">
      <div class="flex justify-between items-center mb-3">
        <div class="text-muted-color">{{ status.toUpperCase() }} EVENTS</div>
        <span class="material-symbols-outlined" :class="`text-cv-${getIcon(status).color}`">{{ getIcon(status).icon }}</span>
      </div>
      <div class="text-red-400" v-if="breakdown.fetchError">{{ breakdown.fetchError }}</div>
      <Skeleton class="p-3 px-6 max-w-24" v-else-if="breakdown.loading" />
      <div class="font-bold text-2xl" v-else>{{ count }}</div>
    </CVCard>
  </div>
</template>

<style scoped></style>
