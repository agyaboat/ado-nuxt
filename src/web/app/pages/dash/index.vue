<script setup lang="ts">
const { user } = storeToRefs(useUserStore())

const displayName = computed(() => {
  if (user.value?.firstName || user.value?.lastName) {
    return `${user.value?.firstName ?? ''} ${user.value?.lastName ?? ''}`.trim()
  }

  return 'there'
})

const initials = computed(() => {
  const first = user.value?.firstName?.charAt(0) ?? ''
  const last = user.value?.lastName?.charAt(0) ?? ''

  return (first + last).toUpperCase() || '?'
})
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <!-- =====================================================
         WELCOME
         ===================================================== -->
    <section>
      <p class="text-sm font-medium text-surface-500">
        Overview
      </p>

      <h1 class="mt-2 text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
        Welcome back, {{ displayName }}.
      </h1>

      <p class="mt-2 max-w-xl text-surface-500 dark:text-surface-400">
        Your workspace is ready. Start building from here.
      </p>
    </section>

    <!-- =====================================================
         ACCOUNT
         ===================================================== -->
    <section class="mt-10">
      <div
        class="rounded-2xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-900"
      >
        <div class="flex items-center gap-4">
          <Avatar
            :label="initials"
            shape="circle"
            size="large"
          />

          <div class="min-w-0">
            <h2 class="font-semibold text-surface-900 dark:text-surface-0">
              {{ displayName }}
            </h2>

            <p class="mt-1 truncate text-sm text-surface-500">
              {{ user?.email || 'No email address available' }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
```
