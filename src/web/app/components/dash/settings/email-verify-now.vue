<script setup lang="ts">
  const {user} = storeToRefs(useUserStore());

  const visible = ref(false)
  const toast = useToast()

  const form = reactive({
    code: '',
  })

  const {setUser} = useUserStore()
  const { fetchCategories } = useEventCategoriesStore()

  const loading = ref(false)

  const verify = async () =>{
    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/user/verify-email`, {
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if(res.ok){
        form.code = ''
        visible.value = false
        toast.add({severity:'success', summary: 'Success', detail: `Email verified successfully.`, life: 5000})
        setUser(data)
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Failed', detail: data?.message || 'Email verification failed', life: 10000})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Network Error', detail: 'Network error occured. Please check your connection and try again', life: 10000})
      console.error(err)
    }finally{
      loading.value = false
    }
  }

  const getVerify = async () =>{
    loading.value = true
    try {
      const res = await useAdoFetch().get(`/dash/user/verify-email`)
      const data = await res.json()
      if(res.ok){
        // toast.add({severity:'success', summary: 'Success', detail: `Email verified successfully.`, life: 5000})
        visible.value = true
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Failed', detail: data?.message || 'Email verification failed', life: 10000})
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
    <span @click="getVerify">
      <slot>
        <Button label="verify now" size="small" severity="warn" variant="link" class="text-amber-500 dark:text-amber-400 font-semibold!" :loading />
      </slot>
    </span>
    <Dialog v-model:visible="visible" header="Email verification" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
      <div class="text-muted-color" v-if="user?.emailVerifiedAt">
        Your email has been verified already. Thank you
      </div>
      <div v-else>
        <div class="text-muted-color">Enter the verification code sent to your email address in the <span class="text-primary">boxes below </span> to proceed.</div>
        <div class="py-4 flex justify-center items-center flex-col gap-5">
          <!-- <label for="event_title">One Time Code</label> -->
          <InputOtp fluid id="event_title" v-model="form.code" :length="7" />
        </div>
        <div class="flex justify-end mb-4" v-if="form.code && form.code.length === 7">
          <Button label="Verify" icon="pi pi-check" iconPos="right" :loading="loading" @click="verify" />
        </div>
        <div class="text-right text-xs font-semibold text-cv-amber">Email may take a few minutes to arrive.</div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
