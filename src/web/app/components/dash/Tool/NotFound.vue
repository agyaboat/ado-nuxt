<template>
  <Card>
    <template #content>
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950">
          <i class="pi pi-exclamation-triangle text-xl" />
        </div>

        <h1 class="mt-5 text-2xl font-bold text-surface-900 dark:text-surface-0">
          Tool not found
        </h1>

        <p class="mt-2 max-w-md text-sm text-surface-500 dark:text-surface-400">
          This tool workspace does not exist or you do not have access to it.
        </p>

        <Button
          label="Back to workspace"
          icon="pi pi-arrow-left"
          class="mt-6"
          @click="navigateTo('/dash')"
        />
      </div>
    </template>
  </Card>
</template>