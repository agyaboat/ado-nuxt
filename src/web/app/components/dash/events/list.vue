<script setup lang="ts">

  const props = defineProps<{model: Model}>()
  const { fetchData} = useEventsDraftStore()

  const {checkData} = useEventsDraftStore()
  onMounted(()=> checkData(props.model))
  watch(()=> props.model, ()=>{
    checkData(props.model)
  }, {deep: true})

  const order = [
    {label: 'Newest First', value: 'newest'},
    {label: 'Oldest First', value: 'oldest'},
    {label: 'Random', value: 'random'},
  ]

  // const eventsList = ref<EventCardProps[]>()
  const filters = reactive({
    selection: '',
    search: '',
    order: 'newest' as 'newest' | 'oldest' | 'random'
  })

  const rowsPerPageOptions = [5, 10, 15, 20]
  const offset = ref(0)
  const perPage = ref(5)

  const el = useTemplateRef('ll')
  watch(()=>offset.value, async ()=>{
    setTimeout(()=>{
      el.value?.scrollIntoView({behavior:'smooth'})
    }, 50)
  })
  watch(()=>perPage.value, async ()=>{
    setTimeout(()=>{
      el.value?.scrollIntoView({behavior:'smooth'})
    }, 50)
  })
const eventsList = ref([])
</script>

<template>
  <div>
    <div class="flex gap-3 items-center w-full lg:w-auto mb-6">
      <div class="grow">
        <IconField class="w-full" fluid>
          <InputIcon class="pi pi-search" />
          <InputText class="w-full" v-model="filters.search" placeholder="search an event" />
        </IconField>
      </div>
      <div>
        <Select v-model="filters.order" :options="order" optionLabel="label" optionValue="value" placeholder="Select Order" class="" />
      </div>
    </div>
    <div v-if="model.fetchError" class="my-10 text-red-400">{{ model.fetchError }}</div>
    <div v-else-if="model.loading">loading...</div>
    <div v-else-if="model.list && model.list.length > 0">
      <div class="mb-5 font-bold text-muted-color flex gap-5">
        <span>Total: </span> 
        <span class="text-primary">{{ model.total }}</span>
      </div>
      <div class="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
        <DashEventsItem v-for="data in model.list" :data />
      </div>
      <div class="text-center flex flex-col gap-3">
        <div class="text-muted-color">
          Loaded: 
          <span class="text-amber-400 font-bold" :class="{'text-primary': model.total == model.list.length}">{{ model.list.length }}</span>
           out of
          <span class="font-bold text-primary">{{ model.total }}</span>
        </div>
        <div class="text-center" v-if="model.total > model.list.length">
          <Button @click="fetchData(model, true)" label="Load More" size="small" icon="pi pi-arrow-down" iconPos="right" :loading="model.moreLoading" />
        </div>
      </div>

    </div>
    <div v-else class="my-10 text-center text-muted-color font-semibold">
      No event available for this selection
    </div>
  </div>
</template>

<style scoped></style>
