<script setup lang="ts">
import type { NuxtLinkProps } from 'nuxt/app';

// import type { NuxtLinkProps } from '#app'
// import iconType  from '~/layouts/default.vue'

defineProps<{to?: NuxtLinkProps}>()
</script>

<template>
  <NuxtLink
    :to="to"
    custom
    v-slot="{ navigate, isActive, isExactActive }"
  >
    <span @click="navigate" class="cursor-pointer hover:text-primary relative w-fit" :class="{'border-b-2 border-primary':isActive, 'text-primary':isExactActive}">
      <slot />
    </span>
  </NuxtLink>
</template>

<style scoped>
a {
  @apply no-underline;
}
</style>
