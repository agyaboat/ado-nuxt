<script setup lang="ts">
import TotalElections from '~/components/dash/index/TotalElections.vue';
import TotalEvents from '~/components/dash/index/TotalEvents.vue';
import { useUserStore } from '~/stores/dash.user';

  definePageMeta({
    name: 'dash'
  })
  const userStore = useUserStore();
  
</script>
 
<template>
  <div class="flex flex-col gap-5">
    <h1 class="text-2xl md:text-3xl font-semibold">Welcome back, {{ userStore.user?.firstName }}!</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
      <DashIndexWalletBalance />
      <DashIndexCredits />
      <DashIndexReferEarn />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <TotalEvents />
      <TotalElections />
    </div>
    <!-- <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <DashIndexPromoEarnings />
      <div class="grid grid-cols-1 gap-5">
        <TotalEvents />
        <TotalElections />
      </div>
    </div> -->
    <div>
      <DashIndexRecentWithdrawals />
    </div>
  </div>
</template>

<style scoped></style>
