<script setup lang="ts">
interface MenuItem {
  label: string
  to: Record<string, any> | string
  icon: string
}

interface MenuSection {
  label: string
  items: MenuItem[]
}

const { user } = storeToRefs(useUserStore())
const { access } = storeToRefs(useFeesManagerAccessStore())

const route = useRoute()

const accessId = computed(() => route.params.access_id as string)

const menus: MenuSection[] = [
  {
    label: 'Main',
    items: [
      {
        label: 'Dashboard',
        to: {
          name: 'fees_manager',
          params: { access_id: accessId.value },
        },
        icon: 'dashboard',
      },
    ],
  },

  {
    label: 'Academic Setup',
    items: [
      {
        label: 'Classes',
        to: {
          name: 'fees_manager.classes',
          params: { access_id: accessId.value },
        },
        icon: 'class',
      },
      {
        label: 'Academic Schedule',
        to: {
          name: 'fees_manager.academic-schedule',
          params: { access_id: accessId.value },
        },
        icon: 'calendar_month',
      },
      {
        label: 'Students',
        to: {
          name: 'fees_manager.students',
          params: { access_id: accessId.value },
        },
        icon: 'groups',
      },
    ],
  },

  {
    label: 'Fees',
    items: [
      // {
      //   label: 'Fee Schedules',
      //   to: {
      //     name: 'fees_manager.fees',
      //     params: { access_id: accessId.value },
      //   },
      //   icon: 'payments',
      // },
      {
        label: 'Fee Payments',
        to: {
          name: 'fees_manager.payments',
          params: { access_id: accessId.value },
        },
        icon: 'receipt_long',
      },
      {
        label: 'Arrears Table',
        to: {
          name: 'fees_manager.arrears',
          params: { access_id: accessId.value },
        },
        icon: 'receipt_long',
      },
    ],
  },

  // {
  //   label: 'Analytics',
  //   items: [
  //     {
  //       label: 'Reports',
  //       to: {
  //         name: 'fees_manager.reports',
  //         params: { access_id: accessId.value },
  //       },
  //       icon: 'bar_chart',
  //     },
  //   ],
  // },

  {
    label: 'System',
    items: [
      {
        label: 'Settings',
        to: {
          name: 'fees_manager.settings',
          params: { access_id: accessId.value },
        },
        icon: 'settings',
      },
    ],
  },
]

const sidebarOpen = ref(false)

function closeSidebar() {
  sidebarOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  },
)
</script>

<template>
  <div
    class="min-h-screen bg-surface-50 text-surface-900
      dark:bg-surface-950 dark:text-surface-0"
  >

    <!-- HEADER -->
    <header
      class="sticky top-0 z-50 h-18 border-b border-surface-200
        bg-white/95 backdrop-blur
        dark:border-surface-800 dark:bg-surface-900/95"
    >
      <div class="flex h-full items-center px-4 lg:px-6">

        <!-- Mobile menu -->
        <Button
          icon="pi pi-bars"
          text
          rounded
          severity="secondary"
          class="mr-2 lg:hidden"
          @click="sidebarOpen = true"
        />

        <!-- Brand -->
        <NuxtLink
          to="/"
          class="flex items-center gap-3"
        >
          <span
            class="material-symbols-outlined
              text-amber-500 dark:text-amber-300"
            style="font-size: 30px;"
          >
            school
          </span>

          <span class="text-lg font-black tracking-tight">
            Fees Manager
          </span>
        </NuxtLink>

        <div class="ml-auto flex items-center gap-2">
          <ColorMode />

          <!-- <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            severity="secondary"
          /> -->
          <EduToolFeesManagerStudentSearch />
        </div>
      </div>
    </header>

    <!-- MOBILE OVERLAY -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 lg:hidden"
        @click="closeSidebar"
      />
    </Transition>

    <!-- APPLICATION BODY -->
    <div class="flex min-h-[calc(100vh-4.5rem)]">

      <!-- SIDEBAR -->
      <aside
        class="
          fixed inset-y-0 left-0 z-50 mt-18 w-64
          -translate-x-full
          border-r border-surface-200
          bg-white
          transition-transform duration-200
          dark:border-surface-800
          dark:bg-surface-900
          lg:sticky lg:top-18 lg:z-30
          lg:mt-0
          lg:h-[calc(100vh-4.5rem)]
          lg:translate-x-0
        "
        :class="{
          'translate-x-0': sidebarOpen,
        }"
      >
        <div class="flex h-full flex-col">

          <!-- NAVIGATION -->
          <nav class="flex-1 overflow-y-auto p-4">

            <!-- School -->
            <!-- <div class="mb-7">
              <p
                class="px-3 text-xs font-bold uppercase
                  text-surface-400"
              >
                {{ access?.school.name }}
              </p>
            </div> -->

            <!-- Menu sections -->
            <div class="space-y-6">
              <div
                v-for="section in menus"
                :key="section.label"
              >
                <p
                  class="mb-2 px-3 text-[11px] font-bold
                    uppercase tracking-[0.18em]
                    text-surface-400"
                >
                  {{ section.label }}
                </p>

                <div class="space-y-1">
                  <MenuLink
                    v-for="menu in section.items"
                    :key="menu.label"
                    :to="menu.to"
                    :icon="menu.icon"
                    icon-type="material"
                  >
                    {{ menu.label }}
                  </MenuLink>
                </div>
              </div>
            </div>

            <Divider class="my-6" />

            <!-- Workspace -->
            <NuxtLink
              :to="{ name: 'dash' }"
              class="
                flex items-center gap-3 rounded-xl px-3 py-3
                text-sm font-semibold
                text-surface-500
                transition-colors
                hover:bg-surface-100 hover:text-surface-900
                dark:text-surface-400
                dark:hover:bg-surface-900
                dark:hover:text-surface-0
              "
            >
              <span class="material-symbols-outlined text-[21px]">
                arrow_back
              </span>

              <span>Back to Workspace</span>
            </NuxtLink>
          </nav>

          <!-- USER -->
          <!-- <div
            class="border-t border-surface-200 p-4
              dark:border-surface-800"
          >
            <SidebarUser
              :username="`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()"
              :href="{ name: 'dash-profile' }"
              tag="Verified"
              :avatar-url="user?.avatar ?? undefined"
            />
          </div> -->
        </div>
      </aside>

      <!-- CONTENT -->
      <main class="min-w-0 flex-1">
        <div
          class="mx-auto w-full max-w-400
            px-4 py-6 md:px-8 md:py-8"
        >
          <slot />
        </div>
      </main>
    </div>
  </div>

  <EduToolFeesManagerSetupWizard />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>