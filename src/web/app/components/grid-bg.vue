<template>
  <ClientOnly>
    <div class="fixed bg-slate-950 inset-0 -z-2 grid grid-cols-6 md:grid-cols-12 gap-1 opacity-10 pointer-events-none">
      <div
        v-for="(cell, i) in grid"
        :key="i"
        class="w-full aspect-square rounded-sm opacity-30 dark:opacity-50 animate-fade-color"
        :style="{
          animationDelay: `${cell.delay}s`,
          animationDuration: `${cell.duration}s`
        }"
      />
    </div>
    <Meteor />
  </ClientOnly>
</template>

<script setup>
  const gridSize = 72
  let grid
  grid = Array.from({ length: gridSize }, () => ({
    delay: +(Math.random() * 5).toFixed(2),     // 0–5s
    duration: 4 + Math.random() * 4,            // 4–8s
  }))

</script>

<style scoped>
  @keyframes fade-color {
    0% {
      background-color: #f59e0b; /* amber-500 */
    }
    50% {
      background-color: #3b82f6; /* blue-500 */
    }
    100% {
      background-color: #f59e0b;
    }
  }

  .animate-fade-color {
    animation-name: fade-color;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
</style>
