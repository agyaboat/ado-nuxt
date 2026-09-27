<script setup lang="ts">
type IconType = 'pi' | 'material'

interface Menu {
  label: string
  to: string | Record<string, any>
  icon?: string
  iconType?: IconType
  badge?: string | number
}

const { user } = storeToRefs(useUserStore())

const menus = computed<Menu[]>(() => [
  {
    label: 'Overview',
    to: { name: 'admin' },
    icon: 'dashboard',
    iconType: 'material',
  },
  {
    label: 'Users',
    to: { name: 'admin-users' },
    icon: 'group',
    iconType: 'material',
  },
  {
    label: 'Tools Registry',
    to: { name: 'admin-tools' },
    icon: 'extension',
    iconType: 'material',
  },
  {
    label: 'Schools',
    to: { name: 'admin-schools' },
    icon: 'school',
    iconType: 'material',
  },
  {
    label: 'Subscriptions',
    to: { name: 'admin-subscriptions' },
    icon: 'subscriptions',
    iconType: 'material',
  },
  {
    label: 'Revenue',
    to: { name: 'admin-revenue' },
    icon: 'payments',
    iconType: 'material',
  },
  {
    label: 'Dropped Schools',
    to: { name: 'admin-churn' },
    icon: 'trending_down',
    iconType: 'material',
  },
  {
    label: 'Audit Logs',
    to: { name: 'admin-audit-logs' },
    icon: 'manage_search',
    iconType: 'material',
  },
  {
    label: 'Settings',
    to: { name: 'admin-settings' },
    icon: 'settings',
    iconType: 'material',
  },
  {
    label: 'Back to dash',
    to: { name: 'dash' },
    icon: 'arrow_back',
    iconType: 'material',
  },
])

const route = useRoute()
const el = useTemplateRef<HTMLElement>('scrollIntoView')

watch(
  () => route.fullPath,
  () => {
    el.value?.scrollIntoView({ behavior: 'smooth' })
  }
)
</script>

<template>
  <GridBg2 />

  <LayoutBase color-mode brand="Admin" user>
    <template #header>
      <div class="flex justify-end gap-2 items-center w-full">
        <OverlayBadge v-if="false" value="" severity="warn" size="small">
          <Button rounded size="small" variant="text" severity="contrast">
            <template #icon>
              <span class="cursor-pointer material-symbols-outlined">
                notifications
              </span>
            </template>
          </Button>
        </OverlayBadge>
      </div>
    </template>

    <template #sidebar>
      <div class="p-4 py-8 font-semibold flex-1">
        <div class="mb-6">
          <p class="text-xs uppercase tracking-wider text-muted-color mb-2">
            Platform
          </p>

          <div class="flex flex-col gap-2">
            <MenuLink
              v-for="menu in menus"
              :key="menu.label"
              :to="menu.to"
              :icon="menu.icon"
              :icon-type="menu.iconType"
            >
              <span class="flex items-center justify-between gap-3 w-full">
                <span>{{ menu.label }}</span>

                <Badge
                  v-if="menu.badge"
                  :value="menu.badge"
                  severity="info"
                />
              </span>
            </MenuLink>
          </div>
        </div>
      </div>
    </template>

    <template #default>
      <div>
        <div ref="scrollIntoView"></div>

        <div class="px-4 md:px-8 py-8">
          <slot />
        </div>

        <!-- <DefaultFooter /> -->
      </div>
    </template>

    <template #sidebar-user>
      <div>
        <Divider :pt="{ root: { class: 'my-1' } }" />

         <SidebarUser :username="`${user?.firstName} ${user?.lastName}`" :href="{name: 'dash-profile'}" tag="Admin" :avatar-url="user?.avatar??undefined"  />
      </div>
    </template>
  </LayoutBase>
</template>