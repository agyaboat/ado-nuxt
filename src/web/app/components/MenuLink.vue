<script setup lang="ts">
import type { NuxtLinkProps } from '#app'

type IconType = 'pi' | 'material'

defineProps<
  NuxtLinkProps & {
    icon?: string
    iconType?: IconType
    badge?: string | number
  }
>()
</script>

<template>
  <NuxtLink
    :to="to"
    custom
    v-slot="{ navigate, isExactActive }"
  >
    <a
      class="
        group relative flex min-h-[42px] w-full
        items-center gap-3
        rounded-lg px-3
        text-[13px] font-medium
        no-underline
        transition-colors duration-150
        cursor-pointer
      "
      :class="
        isExactActive
          ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
      "
      @click="navigate"
    >
      <!-- Active indicator -->
      <span
        class="
          absolute inset-y-0 left-0 w-1 rounded-r-full
          bg-emerald-500 dark:bg-emerald-400
        "
        :class="isExactActive ? 'opacity-100' : 'opacity-0'"
      />

      <!-- Icon -->
      <span
        class="
          flex size-5 shrink-0
          items-center justify-center
          text-[19px]
        "
        :class="
          isExactActive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'
        "
      >
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
      </span>

      <!-- Label -->
      <span class="flex-1 truncate">
        <slot />
      </span>

      <!-- Badge -->
      <span
        v-if="badge"
        class="
          shrink-0 rounded-full
          bg-slate-200 px-2 py-0.5
          text-[10px] font-semibold
          text-slate-600
          dark:bg-slate-700 dark:text-slate-300
        "
      >
        {{ badge }}
      </span>
    </a>
  </NuxtLink>
</template>