<script setup lang="ts">
  export interface EventNominationItem{
    id: string
    nomineeName: string
    nomineeNickname: string | null
    photoUrl: string | null
    nominatorName: string
    nominatorPhone: string
    nominatorComment: string
  }
  
  const props = defineProps<{category: EventCategoryItem}>()
  const visible = ref(false)

  const loading = ref(false)
  const toast = useToast()
  const list = ref<EventNominationItem[] | null>(null)
  const fetchErrors = ref('')

  const getList = async () =>{
    loading.value = true
    fetchErrors.value = ''

    try {
      const res = await useAdoFetch().get(`/dash/event-categories/${props.category.code}/nominations`)
      const data = await res.json()
      if(res.ok){
        list.value = data
      }else{
        useIsUnauthenticated(res)
        fetchErrors.value = data?.message || 'An error occured while loading nominations.'
      }
    } catch (err) {
      fetchErrors.value = 'Network error occured. Check your connection and try again'
      console.error(err)
    }finally{
      loading.value = false
    }
  }

  watch(()=> visible.value, (nv)=>{
    if(nv && !list.value){
      getList()
    }
  }, {immediate: true})

  const relist = (i: number) => {
    list.value?.splice(i, 1)
  }
</script>

<template>
  <div>
    <span @click="visible = !visible">
      <slot>
        <Button label="Nominations" :loading="loading" variant="outlined" severity="info" fluid size="small" >
          <template #icon>
            <span class="material-symbols-outlined">person_check</span>
          </template>
        </Button>
      </slot>
    </span>
    <Dialog v-model:visible="visible" header="Nominations" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
      <div class="">
        <div class="" v-if="loading">Loading...</div>
        <div class="space-y-3" v-else-if="fetchErrors">
          <div class="text-red-400">{{ fetchErrors }}</div>
          <Button label="retry" size="small" @click="getList" />
        </div>
        <div v-else-if="list && list.length < 1" class="space-y-3">
          <div class="text-muted-color">No nominations available now</div>
          <div><Button variant="outlined" size="small" label="Refresh" @click="getList" /></div>
        </div>
        <div v-else class="space-y-5">
          <DashEventCategoryNominationItem v-for="l, index in list" :item="l" :catCode="category.code"  :key="index" @reviewed="relist(index)" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
