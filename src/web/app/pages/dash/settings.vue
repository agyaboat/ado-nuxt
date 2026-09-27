<script setup lang="ts">
definePageMeta({
  name: 'dash-settings',
})

const { user } = storeToRefs(useUserStore())

</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        Settings
      </h1>

      <p class="mt-1 text-sm text-surface-500">
        Manage your account and sign-in methods.
      </p>
    </div>

    <SettingsBasicDetails />

    <SettingsChangePassword v-if="user?.passwordSet" />

    <SettingsSetPassword v-else />

    <SettingsChangePhone />

    <SettingsLinkEmail />
  </div>
</template>