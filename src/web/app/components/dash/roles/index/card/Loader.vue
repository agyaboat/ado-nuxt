<script setup lang="ts"></script>

<template>
  <CVCard class="rounded-lg shadow! lg:px-6 lg:py-4">
    <!-- Header Icons -->
    <div class="flex justify-between">
      <div>
        <div class="rounded-lg p-2 flex items-center">
          <Skeleton shape="circle" size="2.5rem" />
        </div>
      </div>

      <Skeleton shape="circle" size="4.5rem" />
    </div>

    <!-- Title -->
    <div class="mt-4 mb-2">
      <Skeleton width="60%" height="1.5rem" />
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-1">
        <Skeleton width="80%" height="0.75rem" class="mb-2" />
        <Skeleton width="50%" height="1.25rem" />
      </div>

      <div class="col-span-1 mb-6">
        <Skeleton width="80%" height="0.75rem" class="mb-2" />
        <Skeleton width="50%" height="1.25rem" />
      </div>
    </div>

    <!-- Button -->
    <div>
      <Skeleton width="100%" height="2.75rem" borderRadius="0.5rem" />
    </div>
  </CVCard>
</template>

<style scoped></style>
