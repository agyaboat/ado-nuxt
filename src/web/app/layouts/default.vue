```vue
<template>
  <GridBg2 />

  <div class="relative flex min-h-screen flex-col">
    <!-- =====================================================
         HEADER
         ===================================================== -->
    <CVCard
      class="sticky top-0 z-99 rounded-none border-b border-surface-200 bg-surface-0/80 shadow-none backdrop-blur-xl! dark:border-surface-800 dark:bg-surface-950/80 lg:shadow-none"
    >
      <div class="mx-auto flex max-w-7xl items-center gap-3 md:px-2">
        <!-- BRAND -->
        <div class="flex-1">
          <slot name="brand">
            <NuxtLink
              to="/"
              class="group flex w-fit items-center gap-2.5"
            >
              <span
                class="hidden text-xl font-bold tracking-tight text-surface-900 dark:text-surface-0 md:block"
              >
                {{ APP_NAME }}
              </span>
            </NuxtLink>
          </slot>

          <slot name="header" />
        </div>

        <!-- ACTIONS -->
        <div class="flex items-center gap-2">
          <Button
            label="Get started"
            icon="pi pi-arrow-right"
            icon-pos="right"
            size="small"
            as="router-link"
            to="/dash"
          />

          <ColorMode />
        </div>
      </div>
    </CVCard>

    <!-- =====================================================
         PAGE CONTENT

         flex-1 pushes the footer to the bottom when the
         page content is shorter than the viewport.
         ===================================================== -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- =====================================================
         FOOTER
         ===================================================== -->
    <DefaultFooter />
  </div>
</template>
```
