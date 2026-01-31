<script setup lang="ts">
  const props = defineProps<{contestant: EventContestantItem}>()

  const loading = ref(false)
  const { fetchCategories, categories } = useEventCategoriesStore()
  const toast = useToast()
  const route = useRoute()
  const emits = defineEmits()

  const del = async () =>{
    if(!confirm(`Are you sure you want to delete contestant ${props.contestant.name}`)) return;

    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/event-contestants/${props.contestant.code}`, {
        query: {_method: 'DELETE'}
      })
      const data = await res.json()
      if(res.ok){
        emits('hide')
        fetchCategories(String(route.params.event))
        toast.add({severity:'success', summary: 'Success', detail: `Contestant deleted successfully.`})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Failed', detail: data?.message || 'An error occured while deleting contestant. Please check and try again.'})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Error', detail: 'Network error occured. Please check your connection and try again'})
      console.error(err)
    }finally{
      loading.value = false
    }
  }
</script>

<template>
  <Button label="Delete" icon="pi pi-trash" variant="outlined" severity="danger" :loading="loading" @click="del" />
</template>

<style scoped></style>
