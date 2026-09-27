<script setup lang="ts">
const accessStore = useFeesManagerAccessStore()
const academicYearsStore = useFeesManagerAcademicYearsStore()

const { access } = storeToRefs(accessStore)

const {
  academicYears,
  loading,
  error,
} = storeToRefs(academicYearsStore)

const accessId = computed(() => {
  return access.value?.access.id ?? null
})

watch(
  accessId,
  async (id) => {
    if (!id) {
      return
    }

    await academicYearsStore.check(id)
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-8">
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex min-h-60 items-center justify-center"
    >
      <div class="flex flex-col items-center gap-3">
        <ProgressSpinner
          stroke-width="4"
          class="h-9 w-9"
        />

        <p
          class="text-sm text-surface-500
            dark:text-surface-400"
        >
          Loading academic periods...
        </p>
      </div>
    </div>

    <!-- Error -->
    <Message
      v-else-if="error"
      severity="error"
      :closable="false"
    >
      {{ error }}
    </Message>

    <template v-else>
      <!-- Add academic year -->
      <div class="flex justify-end">
        <EduToolFeesManagerAddAcademicYear />
      </div>

      <!-- Empty state -->
      <div
        v-if="academicYears.length === 0"
        class="rounded-2xl border border-dashed
          border-surface-300 px-6 py-12 text-center
          dark:border-surface-700"
      >
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center
            rounded-xl bg-surface-100 text-surface-500
            dark:bg-surface-800 dark:text-surface-300"
        >
          <span class="material-symbols-outlined">
            calendar_month
          </span>
        </div>

        <h2
          class="mt-4 text-lg font-bold
            text-surface-900 dark:text-surface-0"
        >
          No academic years yet
        </h2>

        <p
          class="mx-auto mt-1 max-w-md text-sm
            text-surface-500 dark:text-surface-400"
        >
          Create an academic year to start defining academic
          periods for your school.
        </p>

        <EduToolFeesManagerAddAcademicYear class="mt-5">
          <Button
            label="Add Academic Year"
            icon="pi pi-plus"
            type="button"
          />
        </EduToolFeesManagerAddAcademicYear>
      </div>

      <!-- Academic years -->
      <div
        v-else
        class="space-y-6"
      >
        <EduToolFeesManagerAcademicYear
          v-for="year in academicYears"
          :key="year.id"
          :academic-year="year"
          @deleted="academicYearsStore.fetchAcademicYears(accessId!)"
        />
      </div>

      <!-- Add year -->
      <EduToolFeesManagerAddAcademicYear
        v-if="academicYears.length"
      >
        <div
          class="flex items-center justify-center rounded-2xl
            border border-dashed border-surface-300 px-6 py-8
            dark:border-surface-600"
        >
          <Button
            label="Add Academic Year"
            icon="pi pi-plus"
            severity="secondary"
            text
            type="button"
          />
        </div>
      </EduToolFeesManagerAddAcademicYear>
    </template>
  </div>
</template>