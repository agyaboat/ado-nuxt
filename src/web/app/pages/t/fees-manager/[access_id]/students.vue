<script setup lang="ts">
definePageMeta({
  name: 'fees_manager.students'
})
import { ref } from 'vue'

type View = 'students' | 'classes'

const activeView = ref<View>('students')

const pageTitle = computed(() =>
  activeView.value === 'students'
    ? 'Students'
    : 'Classes'
)

function switchView(view: View) {
  activeView.value = view
}

function handleManageClasses() {
  activeView.value = 'classes'
}
</script>

<template>
  <div class="space-y-8 relative">
    <div class="flex items-center justify-between gap-5 flex-wrap">
      <div>
        <h1
          class="text-3xl font-black tracking-tight
            text-surface-900 dark:text-surface-0"
        >
          Students
        </h1>

        <EduToolFeesManagerContentSchoolName />
      </div>
    </div>

    <!-- <EduToolFeesManagerStudents /> -->
    <EduToolFeesManagerStudents
      @manage-classes="handleManageClasses"
    />

  </div>
</template>