<script setup lang="ts">
import type { NuxtLinkProps } from '#app';


// import iconType  from '~/layouts/default.vue'

defineProps<
  NuxtLinkProps & {
    icon?: string
    iconType?: any
    badge?: string | number
  }
>()
</script>

<template>
  <NuxtLink
    :to="to"
    custom
    v-slot="{ navigate, isActive, isExactActive }"
  >
    <a
      @click="navigate"
      class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
             text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100
             hover:bg-gray-100 dark:hover:bg-slate-800 relative group cursor-pointer"
      :class="isExactActive
        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
        : ''"
    >

      <!-- Accent bar (always rendered) -->
      <div
        class="absolute left-0 top-0 bottom-0 w-1 rounded-r transition-all"
        :class="isExactActive
          ? 'bg-emerald-600 dark:bg-emerald-400 opacity-100'
          : 'opacity-0'"
      />

      <!-- Icon slot (stable wrapper) -->
      <span
        class="shrink-0 text-lg flex items-center"
        :class="isExactActive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'"
      >
        <span class="icon-slot flex">
          <!-- <ClientOnly> -->
            <span
              v-if="iconType === 'material'"
              class="material-symbols-outlined"
            >
              {{ icon }}
            </span>
            <span
              v-else
              :class="`pi ${icon}`"
            />
          <!-- </ClientOnly> -->
        </span>
      </span>

      <!-- Label -->
      <span class="flex-1 text-sm leading-tight">
        <slot />
      </span>

      <!-- Badge (structure preserved) -->
      <span
        v-show="badge"
        class="shrink-0 py-0.5 px-2 rounded-full text-xs font-semibold transition-all"
        :class="isExactActive
          ? 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200'
          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'"
      >
        {{ badge }}
      </span>

    </a>
  </NuxtLink>
</template>

<style scoped>
a {
  @apply no-underline;
}
</style>
