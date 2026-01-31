<script setup lang="ts">
  const toast = useToast()
  const data = "AGYABOAT2025"
  // const cop = ()=>{
  //   copyToClipboard(data)
  // }
  const { text, copy, copied, isSupported } = useClipboard()
  watch(()=> copied.value, (nv)=>{
    if(nv){
      toast.add({detail: 'Promo Code copied to clipboard', summary: 'Copied', severity:'success', life:2000})
    }
  })

  const userStore = useUserStore()
</script>

<template>
  <CVCard class="col-span-1 lg:col-span-4 flex items-center rounded-xl">
      <div>
        <h2 class="font-bold text-lg">Refer & Earn</h2>
        <div class="text-muted-color mb-4">Share your code to earn money</div>
        <div class="flex mb-2">
          <CVCard class="rounded-r-none! grow flex items-center p-3! bg-slate-100! dark:bg-slate-950! select-none">
            <div class="text-center font-bold text-primary" v-if="userStore.user?.promoCode">{{ userStore.user?.promoCode }}</div>
            <div class="text-red-400 text-sm" v-if="!userStore.user?.promoCode || !userStore.user.emailVerifiedAt">
              complete profile setup first
            </div>
          </CVCard>
          <Button class="rounded-l-none!" size="large" @click="copy(userStore.user?.promoCode as string)">
            <template #icon>
              <span class="material-symbols-outlined text-white">content_copy</span>
            </template>
          </Button>
        </div>
        <NuxtLink class="text-primary text-sm font-semibold" to="/">Learn more</NuxtLink>
      </div>
  </CVCard>
</template>

<style scoped></style>
