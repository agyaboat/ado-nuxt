<script setup lang="ts">
import ColorMode from '~/components/ColorMode.vue';

</script>

<template>
  <GridBg />
  <div class="p-5 md:px-10">
    <div class="flex gap-5 items-center justify-between mb-5">
      <div class="flex gap-3 font-bold text-2xl">
        <NuxtLink :to="{name: 'home'}" class="flex gap-1 items-center font-bold text-xl">
          <span class="material-symbols-outlined text-amber-500 dark:text-amber-300 font-black! text-3xl!">logo_dev</span>
          <div class="">AdoNuxt</div>
        </NuxtLink>
      </div>
      <color-mode />
    </div>
    <slot />
  </div>
</template>

<style scoped></style>
