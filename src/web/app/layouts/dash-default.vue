<script setup lang="ts">
interface Menu {
  label: string
  to: Record<string, any> | any
  icon?: string
  iconType?: iconType
}

export type iconType = 'pi' | 'material'

const { user } = storeToRefs(useUserStore())

// ============================================================
// SIDEBAR NAVIGATION
// Add application-specific navigation items here.
// ============================================================

const menus = ref<Menu[]>([
  {
    label: 'Overview',
    to: { name: 'dash' },
    icon: 'home',
    iconType: 'material',
  },
  {
    label: 'Settings',
    to: { name: 'dash-settings' },
    icon: 'settings',
    iconType: 'material',
  },
])

// ============================================================
// ACCOUNT MENU
// ============================================================

const userMenu = ref()

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event)
}

const toast = useToast()
</script>

<template>
  <GridBg2 />

  <LayoutBase
    color-mode
    brand="AdoNuxt"
  >
    <!-- ======================================================
         HEADER ACTIONS
         Account menu lives on the right side of the header.
         ====================================================== -->
    <template #header-actions>
      <Button
        text
        rounded
        size="small"
        severity="secondary"
        aria-label="Account"
        @click="toggleUserMenu"
      >
        <template #icon>
          <span
            class="material-symbols-outlined"
            style="font-size: 24px;"
          >
            account_circle
          </span>
        </template>
      </Button>

      <Popover ref="userMenu">
        <div class="w-64">
          <!-- USER -->
          <div class="flex items-center gap-3 p-1">
            <Avatar
              :label="
                user?.firstName?.charAt(0) ||
                user?.lastName?.charAt(0) ||
                '?'
              "
              shape="circle"
              size="large"
            />

            <div class="min-w-0">
              <div class="truncate font-semibold">
                {{
                  user?.firstName || user?.lastName
                    ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
                    : 'Not set'
                }}
              </div>

              <div class="truncate text-sm text-surface-500">
                {{ user?.email || 'Not set' }}
              </div>
            </div>
          </div>

          <Divider class="my-3" />

          <!-- ACTIONS -->
          <div class="flex flex-col gap-1">
            <Button
              label="Settings"
              icon="pi pi-cog"
              variant="text"
              severity="secondary"
              class="w-full justify-start"
              @click="navigateTo({ name: 'dash-settings' })"
            />

            <Button
              label="Log out"
              icon="pi pi-sign-out"
              variant="text"
              severity="danger"
              class="w-full justify-start"
              @click="logout(toast)"
            />
          </div>
        </div>
      </Popover>
    </template>

    <!-- ======================================================
         SIDEBAR
         ====================================================== -->
    <template #sidebar>
      <div class="space-y-1">
        <MenuLink
          v-for="menu in menus"
          :key="menu.label"
          :to="menu.to"
          :icon="menu.icon"
          :icon-type="menu.iconType"
        >
          {{ menu.label }}
        </MenuLink>
        
        <Divider class="my-4" />
        <MenuLink
          :to="{name: 'home'}"
          icon="pi pi-arrow-left"
          :icon-type="'pi'"
        >
          Homepage
        </MenuLink>

      </div>
    </template>

    <!-- ======================================================
         PAGE CONTENT
         ====================================================== -->
    <slot />
  </LayoutBase>

  <!-- ========================================================
       AUTHENTICATION / ONBOARDING
       ======================================================== -->
  <AuthCompleteSetup />
</template>