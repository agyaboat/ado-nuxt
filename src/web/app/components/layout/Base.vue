<script setup lang="ts">
  useHead({
    title: 'CrownVote',
  })

  const props = defineProps<{user?:boolean, colorMode?:boolean, brand?:'off'|string}>()

  const sidebar = useTemplateRef('sidebar')

  const toggleSidebar = () => {
    sidebar.value?.classList.toggle('-translate-x-full')
  }
  
  const route = useRoute()
  watch(()=> route.fullPath, (nv)=>{
    if(!sidebar.value?.classList.contains('-translate-x-full')){
      sidebar.value?.classList.add('-translate-x-full')
    }
  })

  const handleOutsideClick = (e: MouseEvent) => {
    if (window.innerWidth >= 1024) return
    const el = sidebar.value
    if (!el) return
    
    const isOpen = !el.classList.contains('-translate-x-full')

    if (!isOpen) return

    if (!el.contains(e.target as Node)) {
      el.classList.add('-translate-x-full')
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick)
  })

</script>

<template>
  <div class="relative flex flex-col h-screen">
    <!-- HEADER LAYOUT -->
    <CVCard class="lg:shadow-none rounded-none border-b border-gray-200 dark:border-gray-800 sticky top-0 z-99 backdrop-blur-lg">
      <div class="md:px-2 flex items-center gap-3">
        <div class="lg:hidden">
          <Button icon="pi pi-bars" size="small" variant="outlined" severity="contrast" :pt="{root:{class: 'py-1'}}" @click.stop="toggleSidebar" />
        </div>

        <!-- HEADER SLOT -->
        <div class="flex-1 flex gap-2">
          <slot name="brand">
            <div v-if="brand !== 'off'" class="flex justify-between items-center">
              <NuxtLink to="/" class="flex gap-1 items-center font-bold text-xl">
                <span class="material-symbols-outlined text-amber-500 dark:text-amber-300 font-black! text-3xl!">crown</span>
                <div class="hidden md:block">{{useTruncate(brand) ?? 'AdoNuxt'}}</div>
              </NuxtLink>
            </div>
          </slot>
          <slot name="header">
          </slot>
        </div>
        <!-- END OF HEADER SLOT -->
        <div v-if="colorMode">
          <ColorMode />
        </div>
      </div>
      <!-- <template #content>
      </template> -->
    </CVCard>
    <!-- END OF HEADER LAYOUT -->

    <!-- MAIN SLOT -->
    <div class="flex flex-1 overflow-hidden">

      <!-- SIDEBAR LAYOUT -->
      <div ref="sidebar"
        class="z-101 lg:z-99 -translate-x-full lg:translate-x-0 
          w-62 fixed lg:relative border-r border-gray-200
         dark:border-gray-800
          inset-0 lg:inset-auto flex flex-col
          transition-transform duration-300 ease-out
          bg-white dark:bg-surface-900 shadow-md lg:shadow-none
           overflow-auto
          "
        >

        <div class="lg:hidden sticky top-0 z-50 bg-white dark:bg-surface-900">
          <CVCard class="shadow-none rounded-none">
            <div class="flex justify-between items-center">
              <slot name="brand">
                <div v-if="brand !== 'off'" class="font-bold text-xl">{{useTruncate(brand)??'CrownVote'}}</div>
              </slot>
              <div>
                <Button icon="pi pi-bars" size="small" variant="outlined" severity="contrast" class="lg:hidden" :pt="{root:{class: 'py-1'}}" @click.stop="toggleSidebar" />
              </div>
            </div>
          </CVCard>
          <Divider :pt="{root:{class:'my-0.5'}}" />
        </div>

        <!-- SIDEBAR SLOT -->
        <!-- <slot name="sidebar" v-if="!user">
          sidebar slot
        </slot> -->
        <div class="flex flex-col h-full relative">
          <div class="flex-1">
            <slot name="sidebar">Sidebar Slot</slot>
          </div>
          <div class="sticky bottom-0 z-50 bg-white dark:bg-surface-900">
            <slot name="sidebar-user">
              <div v-if="user">
                <Divider :pt="{root:{class:'my-1'}}" />
                <SidebarUser username="Default User" />
              </div>
            </slot>
          </div>
        </div>
        <!-- END OF SIDEBAR SLOT -->

      </div>
      <!-- END SIDEBAR LAYOUT -->

      <!-- BODY SLOT -->
      <div class="overflow-auto flex-1">
        <slot />
      </div>
      <!-- END OF BODY SLOT -->

    </div>
  </div>
</template>

<style scoped></style>
