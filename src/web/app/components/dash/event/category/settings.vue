<script setup lang="ts">
  const props = defineProps<{category: EventCategoryItem}>()

  const visible = ref(false)
  const toast = useToast()

  const form = reactive({
    name: '',
    description: null as string | null,
    visibility: null as 'public' | 'draft' | null
  })
  const resetForm = () =>{
    form.name = ''
    form.description = ''
    form.visibility = null
  }

  onMounted(()=>{
    form.name = props.category.name
    form.description = props.category.description
    form.visibility = props.category.visibility
  })

  const { fetchCategory, fetchCategories } = useEventCategoriesStore()

  const loading = ref(false)
  const route = useRoute()

  const update = async () =>{
    if(!confirm('Are you sure you want to commit changes made?')) return;
    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/event-categories/${props.category.code}`, {
        body: JSON.stringify(form),
        query: {_method: 'PATCH'}
      })
      const data = await res.json()
      if(res.ok){
        fetchCategory(props.category.code)
        toast.add({severity:'success', summary: 'Category updated', detail: `This category has been updated successfully.`})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Updating Category failed', detail: data?.message || 'An error occured while updating category. Please check and try again.'})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Network Error', detail: 'Network error occured. Please check your connection and try again'})
      console.error(err)
    }finally{
      loading.value = false
    }
  }

  
  const del = async () =>{
    if(!confirm('Are you sure you want to delete this category?')) return;
    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/event-categories/${props.category.code}`, {
        body: JSON.stringify(form),
        query: {_method: 'DELETE'}
      })
      const data = await res.json()
      if(res.ok){
        visible.value = false
        fetchCategories(String(route.params.event))
        toast.add({severity:'success', summary: 'Category deleted', detail: `This category has been deleted.`})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Deleting Category failed', detail: data?.message || 'An error occured while deleting category. Please check and try again.'})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Network Error', detail: 'Network error occured. Please check your connection and try again'})
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
        <Button label="Settings" icon="pi pi-cog" variant="outlined" severity="secondary"  :loading="loading" fluid size="small" />
      </slot>
    </span>
    <Dialog v-model:visible="visible" header="Category Settings" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
      <div>
        <div class="py-4 flex flex-col gap-5 mb-8">
          <FloatLabel variant="in">
            <InputText fluid id="event_title" v-model="form.name" />
            <label for="event_title">Category Name</label>
          </FloatLabel>

          <FloatLabel variant="in">
            <Textarea fluid id="event_inst" v-model="form.description" />
            <label for="event_inst">Short Description</label>
          </FloatLabel>

          <FloatLabel variant="in">
            <Select id="cat.visi" v-model="form.visibility" :options="[{label: 'Visible (public)', value: 'public'},{label: 'Editing (draft)', value: 'draft'}]" option-label="label" option-value="value" fluid />
            <label for="cat.visi">Visibility</label>
          </FloatLabel>
        </div>
        <div class="flex justify-between" v-if="form.name">
          <Button label="Delete" size="small" icon="pi pi-trash" variant="outlined" severity="danger" @click="del" />
          <Button label="Update" size="small" icon="pi pi-check" iconPos="right" :loading="loading" @click="update" />
        </div>
        
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
