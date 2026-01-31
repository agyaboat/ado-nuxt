<script setup lang="ts">
defineProps<{
  user: User
}>()
const visible = ref(false);
</script>

<template>
  <div>
    <span class="material-symbols-outlined text-lg text-cv-emerald cursor-pointer" @click="visible = true">multimodal_hand_eye</span>

    <Dialog v-model:visible="visible" maximizable modal :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
          <template #header>
              <div class="flex gap-3 items-center">
                  <div class="rounded-lg overflow-hidden max-w-12 flex items-center justify-center">
                      <Image :src="user.avatar" preview />
                  </div>
                  <div class="">
                      <div class="text-lg font-bold">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="flex flex-col md:flex-row md:items-center md:gap-2">
                        <div class="text-muted-color text-xs">{{ user.email }}</div>
                        <div class="hidden md:flex">•</div>
                        <div class="text-primary text-xs">{{ user.profile }}</div>
                      </div>
                  </div>
              </div>
          </template>
          <div class="border-t border-cv-slate py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashRolesUsersUserElectionsCard :user="user" />
              <DashRolesUsersUserEventsCard :user="user" />
              <DashRolesUsersUserSyslogsCard :user="user" />
              <DashRolesUsersUserTransferCard :user="user" />
              <DashRolesUsersUserWithdrawalCard :user="user" />
            </div>
          </div>
      </Dialog>
  </div>
</template>

<style scoped></style>
