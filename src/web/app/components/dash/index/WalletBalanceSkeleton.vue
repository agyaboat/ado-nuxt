<script setup lang="ts"></script>

<template>
  <!-- WalletBalanceSkeleton.vue -->
  <div class="cv-card col-span-1 md:col-span-2 lg:col-span-5 flex items-center">
    <div class="flex flex-col gap-6 w-full animate-pulse">
      
      <!-- Top row -->
      <div class="flex">
        <div class="grow flex flex-col gap-3">
          <div class="h-3 w-32 rounded bg-cv-slate"></div>
          <div class="h-10 w-48 rounded bg-cv-slate"></div>
        </div>

        <div>
          <div class="flex items-center p-2 rounded-full bg-cv-slate border border-cv-slate">
            <div class="h-6 w-6 rounded-full bg-cv-gray"></div>
          </div>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="flex gap-5">
        <div class="flex flex-col justify-end grow gap-2">
          <div class="flex gap-3 items-center">
            <div class="h-5 w-16 rounded bg-cv-slate"></div>
            <div class="h-3 w-24 rounded bg-cv-slate"></div>
          </div>
        </div>

        <div>
          <div class="h-9 w-28 rounded bg-cv-slate"></div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped></style>
