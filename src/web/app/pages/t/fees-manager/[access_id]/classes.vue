<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  name: 'fees_manager.classes',
})

const route = useRoute()
const classesStore = useFeesManagerClassesStore()

const accessId = computed(() => route.params.access_id as string)

onMounted(() => {
  classesStore.check(accessId.value)
})
</script>

<template>
  <div class="relative space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-5">
      <div>
        <h1
          class="text-3xl font-black tracking-tight
            text-surface-900 dark:text-surface-0"
        >
          Classes
        </h1>

        <EduToolFeesManagerContentSchoolName />
      </div>
    </div>

    <div class="space-y-6">
      <div class="flex items-center justify-end gap-2">
        <EduToolFeesManagerOrderClasses :classes="classesStore.classes" />

        <EduToolFeesManagerAddClass />
      </div>

      <Message
        v-if="classesStore.error"
        severity="error"
        :closable="false"
      >
        {{ classesStore.error }}
      </Message>

      <div
        v-else-if="classesStore.loading && !classesStore.classes.length"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="h-40 animate-pulse rounded-2xl border border-surface-200
            bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
        />
      </div>

      <div
        v-else-if="!classesStore.classes.length"
        class="rounded-2xl border border-dashed border-surface-300
          p-10 text-center dark:border-surface-700"
      >
        <div
          class="mx-auto flex size-12 items-center justify-center rounded-full
            bg-surface-100 dark:bg-surface-800"
        >
          <i class="pi pi-building-columns text-xl text-surface-500" />
        </div>

        <h3 class="mt-4 font-bold text-surface-900 dark:text-surface-0">
          No classes yet
        </h3>

        <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Create your first class to get started.
        </p>
      </div>

      <div
        v-else
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
      <EduToolFeesManagerClass
          v-for="schoolClass in classesStore.classes"
          :key="schoolClass.id"
          :school-class="schoolClass"
        />
      </div>
    </div>
  </div>
</template>