<script setup lang="ts">
import type { EventNominationItem } from './nominations.vue';

  const props = defineProps<{item: EventNominationItem, catCode: string}>()
  const action = ref<'approve' | 'reject'>()
  const loading = ref(false)
  const emits = defineEmits()
  const toast = useToast()

  const { fetchCategory } = useEventCategoriesStore()

  const review = async () =>{
    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/event-nominations/${props.item.id}`, {
        query: {_method: 'PATCH', action: action.value}
      })
      const data = await res.json()
      if(res.ok){
        if(action.value === 'approve') {
          fetchCategory(props.catCode)
        }
        emits('reviewed')
        toast.add({severity:'success', summary: 'Success', detail: data.message})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Failed', detail: data?.message || 'An error occured while reviewing nomination. Please check and try again.'})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Error', detail: 'Network error occured. Please check your connection and try again'})
      console.error(err)
    }finally{
      loading.value = false
    }
  }

  const act = (act: 'approve' | 'reject') => {
    action.value = act
    review()
  }
</script>

<template>
  <div class="p-2 border border-slate-700/10 dark:border-slate-300/10 bg-slate-50 dark:bg-slate-950 rounded-lg flex justify-between items-center gap-5">
      <div class="flex gap-4 w-full items-center">
      <div class="flex items-center rounded-lg max-h-32 overflow-hidden">
        <Image :src="item.photoUrl??'/usr.png'" alt="Image" class="w-30! md:w-34! lg:w-38!" preview />
      </div>
      <div class="space-y-1 grow">
        <div class="font-semibold text-lg">{{ item.nomineeName }}</div>
        <div v-if="item.nomineeNickname" class="text-muted-color text-sm mb-4">{{ item.nomineeNickname }}</div>
        
        <div class="flex items-center gap-2">
          <Button fluid size="small" label="reject" variant="outlined" severity="danger" :loading @click="act('reject')" v-if="action !=='approve'" />
          <Button fluid size="small" label="approve" variant="outlined" @click="act('approve')" :loading v-if="action !== 'reject'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
