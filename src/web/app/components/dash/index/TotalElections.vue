<script setup lang="ts">
  const {checkSummary, summary} = useServicesSummaryStore()
  onMounted(()=>{
    checkSummary()
  })
</script>

<template>
  <CVCard class="flex items-center rounded-xl">
    <div class="flex gap-5">
      <div class="flex items-center">
        <div class="flex items-center p-3 rounded-lg border border-cv-purple bg-cv-purple">
          <span class="material-symbols-outlined text-cv-purple">ballot</span>
        </div>
      </div>
      <div class="grow">
        <div class="text-muted-color mb-1">TOTAL ELECTIONS CREATED</div>
        <div class="text-red-400 font-semibold" v-if="summary.fetchError">{{ summary.fetchError }}</div>
        <Skeleton class="font-bold text-2xl p-3 px-8 max-w-10" v-else-if="summary.loading"></Skeleton>
        <div class="font-bold text-2xl flex justify-between items-center" v-else>
          <div>{{ summary.data.elections }}</div>
          <div>
            <Button label="view" variant="link" @click="navigateTo({name: 'dash-elections'})" />
          </div>
        </div>
      </div>
    </div>
  </CVCard>
</template>

<style scoped></style>
