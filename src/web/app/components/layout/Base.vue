<script setup lang="ts">
useHead({
  title: APP_NAME,
})

const props = defineProps<{
  user?: boolean
  colorMode?: boolean
  brand?: 'off' | string
}>()

const route = useRoute()

const sidebarOpen = ref(false)

const sidebar = useTemplateRef<HTMLElement>('sidebar')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// Close mobile sidebar whenever navigation changes.
watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  },
)
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
  >
    <!-- ======================================================
         MOBILE OVERLAY
         ====================================================== -->
    <Transition name="fade">
      <button
        v-if="sidebarOpen"
        type="button"
        aria-label="Close sidebar"
        class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden dark:bg-black/60"
        @click="closeSidebar"
      />
    </Transition>

    <!-- ======================================================
         SIDEBAR
         ====================================================== -->
    <aside
      ref="sidebar"
      class="
        fixed inset-y-0 left-0 z-50
        flex w-[264px] flex-col
        border-r border-slate-200
        bg-white
        transition-transform duration-200
        dark:border-slate-800
        dark:bg-slate-900
        -translate-x-full
        lg:translate-x-0
      "
      :class="{
        'translate-x-0': sidebarOpen,
      }"
    >
      <!-- ====================================================
           SIDEBAR BRAND
           ==================================================== -->
      <div
        class="
          flex h-[72px] shrink-0 items-center
          border-b border-slate-200 px-5
          dark:border-slate-800
        "
      >
        <slot name="brand">
          <NuxtLink
            :to="{ name: 'dash' }"
            class="flex items-center gap-3"
            @click="closeSidebar"
          >
            <!-- Application logo / icon -->
            <slot name="headerIcon">
              <div
                class="
                  grid size-9 place-items-center rounded-xl
                  bg-slate-900 text-sm font-bold text-white
                  dark:bg-white dark:text-slate-900
                "
              >
                {{ APP_NAME.charAt(0) }}
              </div>
            </slot>

            <div class="flex min-w-0 flex-col">
              <span
                class="
                  truncate text-[15px] font-bold tracking-tight
                  text-slate-900 dark:text-white
                "
              >
                {{ useTruncate(brand) ?? APP_NAME }}
              </span>

              <span
                class="
                  text-[11px] font-medium
                  text-slate-400 dark:text-slate-500
                "
              >
                Application
              </span>
            </div>
          </NuxtLink>
        </slot>

        <!-- Mobile close -->
        <button
          type="button"
          aria-label="Close sidebar"
          class="
            ml-auto grid size-9 place-items-center rounded-lg
            text-slate-500 hover:bg-slate-100
            hover:text-slate-900
            lg:hidden
            dark:text-slate-400
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
          @click="closeSidebar"
        >
          <span class="material-symbols-outlined">
            close
          </span>
        </button>
      </div>

      <!-- ====================================================
           SIDEBAR NAVIGATION
           ==================================================== -->
      <nav class="flex-1 overflow-y-auto px-3 py-6">
        <slot name="sidebar">
          <div class="px-3 text-sm text-slate-400">
            Sidebar
          </div>
        </slot>
      </nav>

      <!-- ====================================================
           SIDEBAR FOOTER / USER AREA
           ==================================================== -->
      <div
        v-if="$slots['sidebar-user'] || user"
        class="
          shrink-0 border-t border-slate-200 p-3
          dark:border-slate-800
        "
      >
        <slot name="sidebar-user">
          <SidebarUser username="User" />
        </slot>
      </div>
    </aside>

    <!-- ======================================================
         MAIN APPLICATION AREA
         ====================================================== -->
    <div class="min-h-screen lg:ml-[264px]">

      <!-- ====================================================
           HEADER
           ==================================================== -->
      <header
        class="
          sticky top-0 z-30
          flex h-[72px] items-center justify-between
          border-b border-slate-200
          bg-white/90
          px-4 backdrop-blur-xl
          sm:px-6 lg:px-8
          dark:border-slate-800
          dark:bg-slate-900/90
        "
      >
        <!-- LEFT -->
        <div class="flex min-w-0 items-center">

          <!-- Mobile menu -->
          <button
            type="button"
            aria-label="Open navigation"
            class="
              mr-2 grid size-9 place-items-center rounded-lg
              text-slate-500
              hover:bg-slate-100
              hover:text-slate-900
              lg:hidden
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
            @click="toggleSidebar"
          >
            <span class="material-symbols-outlined">
              menu
            </span>
          </button>

          <!-- Header slot -->
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <slot name="header"/>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="flex items-center gap-1">
          <slot name="header-actions" />

          <div
            v-if="colorMode"
            class="ml-1"
          >
            <ColorMode />
          </div>
        </div>
      </header>

      <!-- ====================================================
           PAGE CONTENT
           ==================================================== -->
      <main
        class="
          min-h-[calc(100vh-72px)]
          bg-slate-50
          p-4
          sm:p-6
          lg:p-8
          dark:bg-slate-950
        "
      >
        <div class="mx-auto w-full max-w-[1600px]">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```
