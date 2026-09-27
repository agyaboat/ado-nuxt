<script setup lang="ts">
import { ref } from 'vue'

interface SchoolClass {
  id: string
  name: string
  studentCount: number
  sortOrder: number
}

const classes = ref<SchoolClass[]>([
  {
    id: '1',
    name: 'SHS 1',
    studentCount: 120,
    sortOrder: 1,
  },
  {
    id: '2',
    name: 'SHS 2',
    studentCount: 115,
    sortOrder: 2,
  },
  {
    id: '3',
    name: 'SHS 3',
    studentCount: 98,
    sortOrder: 3,
  },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-end">
      <EduToolFeesManagerAddClass />
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="schoolClass in classes"
        :key="schoolClass.id"
        class="rounded-2xl border border-surface-200 bg-surface-0 p-5 shadow-sm
               dark:border-surface-800 dark:bg-surface-900"
      >
        <div class="flex items-start justify-between">
          <Button
            icon="pi pi-bars"
            type="button"
            severity="secondary"
            text
            rounded
            class="cursor-grab!"
          />

          <Button
            icon="pi pi-ellipsis-v"
            type="button"
            severity="secondary"
            text
            rounded
          />
        </div>

        <div class="mt-4">
          <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0">
            {{ schoolClass.name }}
          </h3>

          <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {{ schoolClass.studentCount }} students
          </p>
        </div>
      </div>
    </div>
  </div>
</template>