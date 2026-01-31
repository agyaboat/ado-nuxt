<script setup lang="ts"></script>

<template>
  <CVCard class="rounded-lg shadow! lg:px-6 lg:py-4">
    <div class="flex justify-between">
      <div>
        <div class="bg-cv-emerald text-cv-emerald rounded-lg p-2 flex items-center">
          <span class="material-symbols-outlined">celebration</span>
        </div>
      </div>
      <span class="material-symbols-outlined text-7xl! text-primary/10">celebration</span>
    </div>
    <div class="font-bold text-xl mb-2">Events & Awards</div>
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-1">
        <div class="text-muted-color font-bold text-sm">Live Events</div>
        <div class="font-bold text-xl">20</div> 
      </div>
      <div class="col-span-1 mb-6">
        <div class="text-muted-color font-bold text-sm">Upcoming Events</div>
        <div class="font-bold text-xl text-amber-400">16</div>
      </div>
    </div>
    <div>
      <Button fluid>
        Manage Events
      </Button>
    </div>
  </CVCard>
</template>

<style scoped></style>
