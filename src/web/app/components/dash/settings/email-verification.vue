<script setup lang="ts">
  const {user} = storeToRefs(useUserStore());
</script>

<template>
  <CVCard class="rounded-lg p-2!">
    <div class="flex justify-between flex-wrap gap-3 items-center">
      <div class="flex gap-3 items-center">
        <span class="material-symbols-outlined text-primary text-[20px]!">mail</span>
        <div class="">
          <div>Email Address</div>
          <div class="text-muted-color text-sm">{{ user?.email }}</div>
        </div>
      </div>
      <div class="flex justify-end w-full md:w-auto">
        <div v-if="user?.emailVerifiedAt" class=" shrink-0 border-cv-emerald border p-0.5 px-2 text-sm rounded-full text-cv-emerald bg-cv-emerald">verified</div>
        <DashSettingsEmailVerifyNow v-else />
      </div>
    </div>
  </CVCard>
</template>

<style scoped></style>
