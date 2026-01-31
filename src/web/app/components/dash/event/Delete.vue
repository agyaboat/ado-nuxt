<script setup lang="ts">
  const props = defineProps<{code: string}>()

  const loading = ref(false)
  const toast = useToast()

  async function del() {
    if(!confirm("Do you really want to delete this event?")){
      return
    }

    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/events/${props.code}`, {
        query: {_method: 'DELETE'}
      })
      const data = await res.json()
      if(res.ok){
        toast.add({severity:'success', summary: 'Event Deleted', detail: `Event has been deleted successfully`})
        const { refreshAllStores } = useEventsDraftStore()
        refreshAllStores()
        navigateTo({name: 'dash-events'})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Event delete failed', detail: data?.message || 'An error occured while deleting this event. Please check and try again.'})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Network Error', detail: 'Network error occured. Please check your connection and try again'})
      // console.error(err)
    }finally{
      loading.value = false
    }
  }
</script>

<template>
  <Button label="Delete Event" severity="danger" icon="pi pi-trash" class="w-full" @click="del" :loading />
</template>

<style scoped></style>
