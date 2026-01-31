<script setup lang="ts">
  const props = defineProps<{category: EventCategoryItem, index?:number }>()
  const isOpen = ref(false);
  const { fetchCategory } = useEventCategoriesStore()

  watch(()=> isOpen.value, (nv)=>{
    if(nv && Date.now() - props.category.lastFetched > 5*60*100){
      fetchCategory(props.category.code)
    }
  }, {immediate: true})

  if(props.index && [1, 2].includes(props.index)) isOpen.value = true;
  
</script>

<template>
  <CVCard class="rounded-lg overflow-hidden p-0!">
    <!-- header -->
      <div class="p-3 flex justify-between cursor-pointer" @click="isOpen = !isOpen">
        <div class="font-semibold">{{ category.name }}</div>
        <Button size="small" severity="secondary">
          <template #icon>
            <span class="material-symbols-outlined">{{ isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</span>
          </template>
        </Button>
      </div>

    <!-- body -->
      <div class="p-3 border-t border-cv-slate" v-if="isOpen">
        <div class="flex flex-col lg:flex-row gap-5 mb-4">
          <div class="flex gap-3 items-center flex-wrap">
            <DashEventCategorySettings :category="category" />
            <DashEventContestantNew :cat-code="category.code" />
            <DashEventCategoryNominations :category="category" />
          </div>
        </div>
       <Divider />
       <div>
        <div v-if="category.fetchError">
          <div class="mb-5 text-red-400">{{ category.fetchError }}</div>
          <Button size="small" label="Try again" @click="fetchCategory(category.code)" />
        </div>
        <div v-else-if="category.loading">Loading details...</div>
        <div v-else>
          <div class="flex justify-between items-center mb-4">
            <div class="uppercase text-muted-color text-sm">Contestants ({{ category.contestants?.length }})</div>
            <Button v-if="category.contestants.length > 3" label="Re-Order" size="small" severity="primary" variant="text" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div v-for="contestant in category.contestants" :key="contestant.code" class="p-2 border border-slate-700/10 dark:border-slate-300/10 bg-slate-50 dark:bg-slate-950 rounded-lg flex justify-between items-center gap-5">
              <div class="flex gap-4 items-center">
                <div class="flex items-center">
                  <Avatar :image="contestant.avatar??undefined" shape="circle" class=" size-18! xs:size-12! md:size-20! lg:size-22!" />
                </div>
                <div class="space-y-1">
                  <div>{{ contestant.nickname }}</div>
                  <div class="flex gap-2 text-xs items-center text-muted-color">
                    <div v-if="contestant.nickname">{{ contestant.name }}</div>
                    <div v-if="contestant.nickname">•</div>
                    <div class="text-amber-400/60 font-semibold">#{{ contestant.code }}</div>
                  </div>
                </div>
              </div>
              <div class="">
                <DashEventContestantUpdate :contestant="contestant" :cat-code="category.code" />
              </div>
            </div>
          </div>
        </div>
       </div>
      </div>
  </CVCard>
</template>

<style scoped></style>
