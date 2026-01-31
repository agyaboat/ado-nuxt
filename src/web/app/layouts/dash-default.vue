<script setup lang="ts">
import type { Menu } from '~/types/general';
export type iconType = 'pi'|'material'

const {user} = storeToRefs(useUserStore())

const menus = ref<Menu[]>([
  {
    label: 'Dashboard',
    to: {name: 'dash'},
    icon: 'dashboard',
    iconType: 'material'
  },
])

const route = useRoute()
const el = useTemplateRef('scrollIntoView')
watch(()=>route.fullPath, (v)=>{
  el.value?.scrollIntoView({behavior:'smooth'})
})
</script>

<template>
  <GridBg />
  <LayoutBase color-mode brand="AdoNuxt" user>
    <template #header>
      <div class="flex justify-end gap-2 items-center w-full">
        <OverlayBadge value="" severity="warn" size="small">
          <Button rounded size="small" variant="text" severity="contrast">
            <template #icon>
              <span class="cursor-pointer material-symbols-outlined">notifications</span>
            </template>
          </Button>
        </OverlayBadge>
      </div>
    </template>
    <template #sidebar>
      <div class="p-4 py-8 font-semibold flex-1">
        <div class="flex flex-col gap-2 mb-8">
          <MenuLink v-for="menu in menus" :to="menu.to" :icon="menu.icon" :icon-type="menu.iconType">{{menu.label}}</MenuLink>
        </div>
      </div>
    </template>
    <template #default>
      <div>
        <div ref="scrollIntoView"></div>
        <div class="px-4 md:px-8 py-8">
          <slot />
        </div>
      </div>
    </template>

    <template #sidebar-user>
      <div>
        <Divider :pt="{root:{class:'my-1'}}" />
        <SidebarUser username="Agyemang Bright" :href="{name: 'dash-profile'}" tag="Verified" avatar-url="/agyaboat.jpg"  />
      </div>
    </template>
  </LayoutBase>
</template>

<style scoped></style>
