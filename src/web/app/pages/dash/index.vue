<script setup lang="ts">

  definePageMeta({
    name: 'dash'
  })
  const userStore = useUserStore();
  
</script>
 
<template>
  <div class="flex flex-col gap-5">
    <h1 class="text-2xl md:text-3xl font-semibold">Welcome back, {{ userStore.user?.firstName }}!</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
    </div>
  </div>
</template>

<style scoped></style>
