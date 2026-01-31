<template>
  <div
    class="flex min-h-[60vh] items-center justify-center px-4 transition-colors"
  >
    <Card
      class="w-full max-w-md border border-gray-200 shadow-lg
             dark:border-gray-800 dark:bg-gray-900"
    >
      <template #content>
        <div class="flex flex-col items-center text-center gap-4">
          <!-- Icon -->
          <span
            class="material-symbols-outlined text-6xl! text-red-500
                   dark:text-red-400"
            aria-hidden="true"
          >
            lock
          </span>

          <!-- Title -->
          <h2 class="text-xl font-semibold tracking-tight">
            Not enough permissions
          </h2>

          <!-- Message -->
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            You don't have the required access to view this resource.
            If you believe this is a mistake, reach out to your administrator.
          </p>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <Button
              label="Go back"
              severity="secondary"
              outlined
              @click="goBack"
            />
            <Button
              v-if="false"
              label="Request access"
              icon="pi pi-send"
              @click="requestAccess"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
// import Card from 'primevue/card'
// import Button from 'primevue/button'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  navigateTo('/dash')
}

function requestAccess() {
  // hook this into your RBAC / support flow
  router.push({ name: 'support' })
}
</script>
