<script setup lang="ts">
interface Menu {
  label: string
  to: Record<string, any> | any
  icon?: string
  iconType?: string
}

export type iconType = 'pi' | 'material'

const { user } = storeToRefs(useUserStore())

const menus = ref<Menu[]>([
  {
    label: 'Workspace',
    to: { name: 'dash' },
    icon: 'dashboard',
    iconType: 'material',
  },
  {
    label: 'Tools Explorer',
    to: { name: 'dash:tools-explorer' },
    icon: 'explore',
    iconType: 'material',
  },
  {
    label: 'Tutoria',
    to: '#',
    icon: 'menu_book',
    iconType: 'material',
  },
  // {
  //   label: 'Settings',
  //   to: '#',
  //   icon: 'settings',
  //   iconType: 'material',
  // },
])

const route = useRoute()
const el = useTemplateRef('scrollIntoView')

const userMenu = ref()

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event)
}

watch(
  () => route.fullPath,
  () => {
    el.value?.scrollIntoView({ behavior: 'smooth' })
  },
)
const toast = useToast()
</script>

<template>
  <GridBg2 />

  <LayoutBase color-mode brand="ScholarSaas">
    <template #header>
      <div class="flex w-full items-center justify-end">
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
      </div>
    </template>

    <template #sidebar>
      <div class="flex-1 p-4 py-8 font-semibold">
        <div class="mb-8 flex flex-col gap-2">
          <MenuLink
            v-for="menu in menus"
            :key="menu.label"
            :to="menu.to"
            :icon="menu.icon"
            :icon-type="menu.iconType"
          >
            {{ menu.label }}
          </MenuLink>
        </div>
      </div>
    </template>

    <template #default>
      <div>
        <div ref="scrollIntoView"></div>

        <div class="px-4 py-8 md:px-8">
          <slot />
        </div>

        <DefaultFooter v-if="false" />
      </div>
    </template>
  </LayoutBase>

  <AuthCompleteSetup />
</template>