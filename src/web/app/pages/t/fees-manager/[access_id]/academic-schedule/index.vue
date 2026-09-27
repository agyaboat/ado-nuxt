<script setup lang="ts">
definePageMeta({
  name: 'fees_manager.academic-schedule'
})
</script>

<template>
  <div class="space-y-8 relative">
    <div class="flex items-center gap-5 justify-between flex-wrap">
      <div>
        <h1
          class="text-3xl font-black tracking-tight
            text-surface-900 dark:text-surface-0"
        >
          Academic Schedule
        </h1>

        <EduToolFeesManagerContentSchoolName />
      </div>

    </div>

    <EduToolFeesManagerAcademicSchedule />
  </div>
</template>