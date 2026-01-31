<script setup lang="ts">
  import type { FileUploadSelectEvent } from 'primevue';

  const props = defineProps<{contestant: EventContestantItem, catCode: string}>()

  const visible = ref(false)
  const toast = useToast()
  const avatarSrc = ref()

  const form = reactive({
    name: null as string | null,
    nickname: null as string | null,
    avatar: null as string | null,
    newCategory: null as string | null,
  })

  onMounted(() => {
    form.name = props.contestant.name
    form.nickname = props.contestant.nickname
  })

  watch(()=> props.contestant, (nv)=>{
    form.name = nv.name
    form.nickname = nv.nickname
  })

  const { fetchCategory, categories, fetchCategories } = useEventCategoriesStore()

  const loading = ref(false)
  const route = useRoute()

  const update = async () =>{
    loading.value = true
    const formData = new FormData()
    Object.entries(form).forEach(([k, v])=>{
      if(!v) return;
      formData.append(k, v)
    })
    try {
      const res = await useAdoFetch().post(`/dash/event-contestants/${props.contestant.code}`, {
        body: formData,
        query: {_method: 'PATCH'}
      })
      const data = await res.json()
      if(res.ok){
        fetchCategory(props.catCode)
        toast.add({severity:'success', summary: 'Success', detail: `Contestant updated successfully.`})
        if(form.newCategory){
          form.newCategory = null
          fetchCategories(String(route.params.event))
        }
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Failed', detail: data?.message || 'An error occured while updating contestant. Please check and try again.'})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Error', detail: 'Network error occured. Please check your connection and try again'})
      console.error(err)
    }finally{
      loading.value = false
    }
  }

function onFileSelect(event: FileUploadSelectEvent) {
  const file = event.files[0]
  // form.avatar = file
  // console.log(file)
  const reader = new FileReader();

  reader.onload = async (e) => {
      avatarSrc.value = e.target?.result;
  };

  reader.readAsDataURL(file);
  compressImage(file).then((compressed) => {
    form.avatar = compressed as any
  })
}

const clearImg = ()=>{
  avatarSrc.value = undefined
  form.avatar = null
}

const categoryOptions = computed(()=> {
  return Object.values(categories.list).map((cat) => {
    return {
      label: cat.name,
      value: cat.code
    }
  }).filter((c) => c.value !== props.catCode)
})
</script>

<template>
  <div>
    <span @click="visible = !visible">
      <slot>
        <Button icon="pi pi-pencil" severity="secondary" size="small" variant="text" />
      </slot>
    </span>
    <Dialog v-model:visible="visible" header="Update Contestant" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
      <div>
        <div class="py-4 flex flex-col gap-5">
          <div>
            <Button size="small" variant="outlined" severity="secondary" label="Preview" @click="navigateTo({name: 'home-event-contestant', params: {code: props.contestant.code}}, {external: true, open: {target: '_blank'}})" />
          </div>
          <FloatLabel variant="in">
            <InputText fluid id="event_title" v-model="form.name" />
            <label for="event_title">Contestant Name</label>
          </FloatLabel>
          <FloatLabel variant="in">
            <InputText fluid id="event_title" v-model="form.nickname" />
            <label for="event_title">Contestant Nickname</label>
          </FloatLabel>

          <div class="mb-5 space-y-3">
            <div class="flex flex-col gap-2">
              <div>Avatar</div>
              <div class="flex gap-4">
                <FileUpload mode="basic" :chooseLabel="form.avatar || contestant.avatar?'Change Image':'Add Image'" :chooseIcon="form.avatar || contestant.avatar ? 'pi pi-sync' : 'pi pi-plus'" @select="onFileSelect" customUpload auto  accept="image/*" :maxFileSize="10000000" :chooseButtonProps="{variant:'outlined', size:'small'}" />
                <Button v-if="form.avatar" icon="pi pi-trash" @click="clearImg" size="small" severity="secondary" />
              </div>
            </div>
            <div class="rounded-lg overflow-hidden max-w-40" v-if="avatarSrc || contestant.avatar">
              <Image :src="avatarSrc??contestant.avatar" :alt="contestant.name" preview  />
            </div>
          </div>

          <div class="space-y-2">
            <div>Change Category: </div>
            <FloatLabel variant="in">
              <Select id="cat.visi" v-model="form.newCategory" :options="categoryOptions" option-label="label" option-value="value" fluid />
              <label for="cat.visi">Choose new Category</label>
            </FloatLabel>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-between w-full p-1">
          <DashEventContestantDelete :contestant="contestant" @hide="visible = false" />
          <Button label="Save" :loading="loading" @click="update" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped></style>
