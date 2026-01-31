<script setup lang="ts">
const { model, checkData } = useRoleUsersStore()

onMounted(() => {
  checkData('stat')
})
</script>

<template>
  <CVCard class="rounded-lg shadow! lg:px-6 lg:py-4">
    <div class="flex justify-between">
      <div>
        <div class="bg-cv-emerald text-cv-emerald rounded-lg p-2 flex items-center">
          <span class="material-symbols-outlined">group</span>
        </div>
      </div>
      <span class="material-symbols-outlined text-7xl! text-primary/10">group</span>
    </div>
    <div class="font-bold text-xl mb-2">User Management</div>
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-1">
        <div class="text-muted-color font-bold text-sm">Total Users</div>
        <div v-if="model.stat.fetchError" class="text-red-400 font-semibold" >fetch error</div>
        <Skeleton v-else-if="model.stat.loading" class="p-4 max-w-20" />
        <div v-else class="font-bold text-xl">{{ model.stat.data.totalUsers }}</div> 
      </div>
      <div class="col-span-1 mb-6">
        <div class="text-muted-color font-bold text-sm">Active Users</div>
        <div v-if="model.stat.fetchError" class="text-red-400 font-semibold" >fetch error</div>
        <Skeleton v-else-if="model.stat.loading" class="p-4 max-w-20" />
        <div v-else class="font-bold text-xl text-amber-400">{{ model.stat.data.activeUsers }}</div>
      </div>
    </div>
    <div>
      <DashRolesUsers>
        <Button fluid>
          Manage Users
        </Button>
      </DashRolesUsers>
    </div>
  </CVCard>
</template>

<style scoped></style>
