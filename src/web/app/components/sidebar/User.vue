<script setup lang="ts">
  import type { RouteLocationRaw } from 'vue-router';

  const props = defineProps<{avatarUrl?: string, href?: RouteLocationRaw, username: string, tag?:string}>()

  const navigate = ()=>{
    if(props.href){
      navigateTo(props.href)
    }
  }
  definePageMeta({
    middleware: ['dash-auth']
  })
  const {user} = storeToRefs(useUserStore())
  
</script>

<template>
  <div v-ripple class="m-1 p-1 py-2 cursor-pointer rounded-md hover:bg-gray-200/90 dark:hover:bg-slate-800/90 flex items-center justify-between gap-1" @click="navigate">
    <div class="flex gap-2 items-center">
      <div class="flex items-center">
        <slot name="avatar">
          <Avatar v-if="user?.avatar" shape="circle" :image="user.avatar"  />
          <Avatar v-else class="size-7 rounded-full" icon="pi pi-user" />
        </slot>
      </div>
      <div class="flex flex-col text-sm">
        <slot name="username">
          <div>{{`${user?.firstName} ${user?.lastName}`}}</div>
        </slot>
        <slot name="tag">
          <div class="text-xs text-primary" v-if="user?.emailVerifiedAt">Verified</div>
          <div class="text-xs text-cv-red" v-else>Not Verified</div>
        </slot>
      </div>
    </div>
    <!-- <div class="text-xs">
    <Button label="upgrade" rounded variant="outlined" size="small" severity="contrast" class="text-xs" />
    </div> -->
  </div>
</template>

<style scoped></style>