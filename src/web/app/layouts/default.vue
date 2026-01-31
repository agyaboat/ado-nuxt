<template>
  <GridBg />
  <div class="relative">
    <CVCard class="lg:shadow-none rounded-none border-b border-gray-200 dark:border-gray-800 sticky top-0 z-99 backdrop-blur-lg!">
      <div class="md:px-2 flex items-center gap-3">
        <div class="lg:hidden">
          <Button icon="pi pi-bars" size="small" variant="outlined" severity="contrast" :pt="{root:{class: 'py-1'}}" />
        </div>
        <!-- HEADER SLOT -->
        <div class="flex-1 flex gap-2">
          <slot name="brand">
            <div class="flex justify-between items-center">
              <NuxtLink to="/" class="flex gap-3 items-center font-bold text-xl">
                <span class="material-symbols-outlined text-amber-500 dark:text-amber-300 font-black! text-3xl!">logo_dev</span>
                <div class="hidden md:block">AdoNuxt</div>
              </NuxtLink>
            </div>
          </slot>
          <slot name="header">
          </slot>
        </div>
        <!-- END OF HEADER SLOT -->
        <ColorMode />
      </div>
      <!-- <template #content>
      </template> -->
    </CVCard>
    <div>
      <slot />
    </div>
  </div>
</template>

