<script setup lang="ts">
  import type { EventCardProps } from '~/types/event';

  const props = defineProps<{data: EventCardProps}>()

  const loading = ref(false)
  const toast = useToast()

  async function restore() {
    if(!confirm("Do you really want to restore this event?")){
      return
    }

    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/events/${props.data.code}/restore`, {
        query: {_method: 'PATCH'}
      })
      const data = await res.json()
      if(res.ok){
        toast.add({severity:'success', summary: 'Event restored', detail: `Event has been restored successfully`})
        const { refreshAllStores } = useEventsDraftStore()
        refreshAllStores()
        navigateTo({name: 'dash-events'})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Event restoration failed', detail: data?.message || 'An error occured while restoring this event. Please check and try again.'})
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
  <div class="p-4">
    <div>
      <h2 class="font-bold text-xl max-w-full overflow-hidden">{{ data?.title }}</h2>
      <div class="text-muted-color text-sm">Deleted At {{  }} </div>
    </div>
    <Divider />
    <div>
      <div class="flex status-ended">
        <Button class="bg-cv-blue text-cv-slate hover:bg-blue-300! dark:hover:bg-blue-500! border-cv-slate" fluid size="small" label="Restore" @click="restore">
          <template #icon>
            <span class="material-symbols-outlined">restore_from_trash</span>
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
