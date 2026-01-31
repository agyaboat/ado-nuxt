<script setup lang="ts">
  const props = defineProps<{code: string}>()

  const visible = ref(false)
  const toast = useToast()

  const form = reactive({
    name: '',
    description: ''
  })
  const resetForm = () =>{
    form.name = ''
    form.description = ''
  }

  const { fetchCategories } = useEventCategoriesStore()

  const loading = ref(false)

  const add = async () =>{
    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/events/${props.code}/categories`, {
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if(res.ok){
        resetForm()
        fetchCategories(props.code)
        toast.add({severity:'success', summary: 'Category added', detail: `New category added successfully.`, life: 5000})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Adding Category failed', detail: data?.message || 'An error occured while adding category. Please check and try again.', life: 10000})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Network Error', detail: 'Network error occured. Please check your connection and try again', life: 10000})
      console.error(err)
    }finally{
      loading.value = false
    }
  }

</script>

<template>
  <div>
    <span @click="visible = !visible">
      <slot>
        <Button label="Add Category" icon="pi pi-plus" :loading="loading" fluid size="small" />
      </slot>
    </span>
    <Dialog v-model:visible="visible" header="New Category" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
      <div>
        <div class="py-4 flex flex-col gap-5">
          <FloatLabel variant="on">
            <InputText fluid id="event_title" v-model="form.name" />
            <label for="event_title">Category Name</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <Textarea fluid id="event_inst" v-model="form.description" />
            <label for="event_inst">Short Description</label>
          </FloatLabel>
        </div>
        <div class="flex justify-end" v-if="form.name">
          <Button label="Add" icon="pi pi-check" iconPos="right" :loading="loading" @click="add" />
        </div>
        
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
