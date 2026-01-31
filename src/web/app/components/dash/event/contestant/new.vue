<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue';

  const props = defineProps<{catCode: string}>()

  const visible = ref(false)
  const toast = useToast()
  const avatarSrc = ref()

  const form = reactive({
    name: null as string | null,
    nickname: null as string | null,
    avatar: null as string | null,
  })

  const resetForm = () =>{
    form.name = null
    form.nickname = null
    form.avatar = null
    avatarSrc.value = null
  }

  const { fetchCategory } = useEventCategoriesStore()

  const loading = ref(false)

  const add = async () =>{
    loading.value = true
    const formData = new FormData()
    Object.entries(form).forEach(([k, v])=>{
      if(!v) return;
      formData.append(k, v)
    })
    try {
      const res = await useAdoFetch().post(`/dash/event-categories/${props.catCode}/contestants`, {
        body: formData
      })
      const data = await res.json()
      if(res.ok){
        resetForm()
        fetchCategory(props.catCode)
        toast.add({severity:'success', summary: 'Contestant added', detail: `New contestant added successfully.`})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Adding Contestant failed', detail: data?.message || 'An error occured while adding contestant. Please check and try again.'})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Network Error', detail: 'Network error occured. Please check your connection and try again'})
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

</script>

<template>
  <div>
    <span @click="visible = !visible">
      <slot>
        <Button label="Add Contestant" icon="pi pi-user-plus" :loading="loading" variant="outlined" fluid size="small" />
      </slot>
    </span>
    <Dialog v-model:visible="visible" header="New Contestant" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
      <div>
        <div class="py-4 flex flex-col gap-5">
          <FloatLabel variant="on">
            <InputText fluid id="event_title" v-model="form.name" />
            <label for="event_title">Contestant Name</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputText fluid id="event_title" v-model="form.nickname" />
            <label for="event_title">Contestant Nickname</label>
          </FloatLabel>
          <div class="flex flex-col gap-2">
            <div>Avatar</div>
            <div class="flex gap-4">
              <FileUpload mode="basic" :chooseLabel="form.avatar?'Change Image':'Add Image'" @select="onFileSelect" customUpload auto  accept="image/*" :maxFileSize="10000000" :chooseButtonProps="{variant:'outlined', size:'small'}" />
              <Button v-if="form.avatar" icon="pi pi-trash" @click="clearImg" size="small" severity="secondary" />
            </div>
          </div>
          <div class="rounded-lg overflow-hidden max-w-40" v-if="avatarSrc">
            <img :src="avatarSrc" alt="">
          </div>
        </div>
        <div class="flex justify-end" v-if="form.name && form.avatar">
          <Button label="Add" icon="pi pi-check" iconPos="right" :loading="loading" @click="add" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
