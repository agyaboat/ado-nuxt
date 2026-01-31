<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue';


  // const props = defineProps<{user: User}>()
  const {user} = storeToRefs(useUserStore())
  const {setUser} = useUserStore()
  const form = reactive({
    firstName: user.value?.firstName,
    lastName: user.value?.lastName,
    middleName: user.value?.middleName,
    email: user.value?.email,
    phone: user.value?.phone,
    photo: null as string | null
  })

  const src = ref();

  function onFileSelect(event: FileUploadSelectEvent) {
      const file = event.files[0]
      // form.detail.logo = file
      console.log(file)
      const reader = new FileReader();

      reader.onload = async (e) => {
          src.value = e.target?.result;
      };

      reader.readAsDataURL(file);
      compressImage(file).then((compressed) => {
        form.photo = compressed as any
      })
  }
  const clearImg = ()=>{
    src.value = undefined
    form.photo = ''
  }

  const toast = useToast()
  const loading = ref(false)
  const update = async () =>{
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if(!v){
        return
      }
      formData.append(k, v)
    })

    loading.value = true;

    try {
      const res = await adofetch.post('/dash/user/profile', {
        body: formData,
        query: {_method: 'PATCH'}
      })
      const data = await res.json()
      if(res.ok){
        toast.add({severity:'success', summary: 'Success', detail: 'Profile updated successfull'})
        setUser(data)
        clearImg()
      }else{
        useIsUnauthenticated(res)
        if(res.status == 422){
          useToastErrors(toast, data.errors??[])
        }else{
          toast.add({severity:'error', summary: 'Failed', detail: data?.message || 'An error occured while updating profile. Please check and try again.'})
        }
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
  <Card>
    <template #header>
      <div class="text-lg font-bold flex gap-2 items-center p-3 border-b border-cv-slate">
        <span class="material-symbols-outlined text-primary">person</span>
        <div>User Profile</div>
      </div>
    </template>

    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-5 mb-8">
        <div class=" col-span-1 md:col-span-2 flex flex-col items-center gap-2 min-h-40">
          <Avatar shape="circle":label="(form.photo || user?.avatar)? undefined:`${user!.firstName[0]}${user!.lastName[0]}`" class="size-28" :image="(form.photo?src:null) || user?.avatar" />
          <div class="flex gap-2">
            <FileUpload mode="basic" :chooseLabel="(form.photo || user?.avatar)?'Change Photo':'Add Photo'" @select="onFileSelect" customUpload auto  accept="image/*" :maxFileSize="10000000" :chooseButtonProps="{
              variant: 'link',
              size: 'small',
              class: 'font-semibold',
              icon: `pi ${(form.photo || user?.avatar)?'pi-sync' : 'pi-plus'}`
            }" />

            <Button v-if="form.photo" icon="pi pi-trash" @click="clearImg" size="small" severity="secondary" />
          </div>
          <!-- <div class="flex items-center">
          </div> -->
          <!-- <Button variant="link" size="small" class="font-semibold" label="Change Photo" /> -->
        </div>
        <div class="col-span-1 md:col-span-5 ">
          <div class="space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <div class="">
                <FloatLabel variant="on">
                  <InputText fluid id="user.firstName" v-model="form.firstName" />
                  <label for="user.firstName">First Name</label>
                </FloatLabel>
              </div>
              <div class="">
                <FloatLabel variant="on">
                  <InputText fluid id="user.lastName" v-model="form.middleName" />
                  <label for="user.middleName">Middle Name</label>
                </FloatLabel>
              </div>
              <div class="">
                <FloatLabel variant="on">
                  <InputText fluid id="user.lastName" v-model="form.lastName" />
                  <label for="user.lastName">Last Name</label>
                </FloatLabel>
              </div>
              <div class="">
                <FloatLabel variant="on">
                  <InputText fluid id="user.phone" v-model="form.phone" />
                  <label for="user.email">Phone number</label>
                </FloatLabel>
              </div>
              <div class="">
                <FloatLabel variant="on">
                  <InputText type="email" fluid id="user.email" v-model="form.email" />
                  <label for="user.email">Email</label>
                </FloatLabel>
              </div>
              <div>
                <Button label="Update" @click="update" :loading fluid />
              </div>
            </div>
            <div>
              <div class="text-muted-color mb-4 font-semibold">ACCOUNT VERIFICATION</div>
              <div class="flex flex-col gap-3">
                <DashSettingsEmailVerification />
                <CVCard v-if="false" class="rounded-lg p-2!">
                  <div class="flex justify-between flex-wrap gap-3 items-center">
                    <div class="flex gap-3 items-center">
                      <span class="material-symbols-outlined text-primary text-[20px]!">mobile_3</span>
                      <div class="">
                        <div>Phone Number</div>
                        <div class="text-muted-color text-sm">{{ user?.phone ?? 'Not set' }}</div>
                      </div>
                    </div>
                    <div class="flex justify-end">
                      <div class=" shrink-0 border-cv-emerald border p-0.5 px-2 text-sm rounded-full text-cv-emerald bg-cv-emerald">verified</div>
                    </div>
                  </div>
                </CVCard>
                <CVCard class="rounded-lg p-2!">
                  <div class="flex justify-between flex-wrap gap-3 items-center">
                    <div class="flex gap-3 items-center">
                      <span class="material-symbols-outlined text-primary text-[20px]!">globe</span>
                      <div class="">
                        <div>Nationality</div>
                        <!-- <div class="text-muted-color text-sm">{{ user?.citizenship ?? 'Not set' }}</div> -->
                        <div class="text-muted-color text-sm italic">under dev</div>
                      </div>
                    </div>
                    <div class="flex justify-end">
                      <!-- <div class=" shrink-0 border-cv-emerald border p-0.5 px-2 text-sm rounded-full text-cv-emerald bg-cv-emerald">verified</div> -->
                      <div class=" shrink-0 border-cv-emerald border p-0.5 px-2 text-sm rounded-full text-cv-purple bg-cv-purple">pending</div>
                    </div>
                  </div>
                </CVCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
