<script setup lang="ts">
definePageMeta({
  name: 'fees_manager.arrears'
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
          Arrears Table
        </h1>

        <EduToolFeesManagerContentSchoolName />
      </div>
    </div>

    <EduToolFeesManagerArrearsTable />

  </div>
</template>