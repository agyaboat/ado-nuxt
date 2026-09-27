<script setup lang="ts">
const accessStore = useFeesManagerAccessStore()
const academicScheduleStore = useFeesManagerAcademicScheduleStore()

const { access } = storeToRefs(accessStore)

const {
  currentAcademicYear,
  pastAcademicYears,
  loading,
  error,
} = storeToRefs(academicScheduleStore)

const accessId = computed(() => {
  return access.value?.access.id ?? null
})

const hasAcademicYears = computed(() => {
  return (
    currentAcademicYear.value !== null ||
    pastAcademicYears.value.length > 0
  )
})

watch(
  accessId,
  async (id) => {
    if (!id) {
      return
    }

    await academicScheduleStore.check(id)
  },
  { immediate: true },
)

async function refresh() {
  if (!accessId.value) {
    return
  }

  await academicScheduleStore.fetchAcademicYears(
    accessId.value,
  )
}
</script>

<template>
  <div class="space-y-10">
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
          Loading academic schedule...
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

    <!-- Schedule -->
    <template v-else>
      <!-- ------------------------------------------------------------------ -->
      <!-- Completely new subscription -->
      <!-- ------------------------------------------------------------------ -->
      <div
        v-if="!hasAcademicYears"
        class="rounded-2xl border border-dashed
          border-surface-300 px-6 py-16 text-center
          dark:border-surface-700"
      >
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center
            rounded-2xl bg-surface-100 text-surface-500
            dark:bg-surface-800 dark:text-surface-300"
        >
          <span class="material-symbols-outlined text-2xl">
            calendar_month
          </span>
        </div>

        <h2
          class="mt-5 text-xl font-bold
            text-surface-900 dark:text-surface-0"
        >
          Start your academic year here
        </h2>

        <p
          class="mx-auto mt-2 max-w-lg text-sm leading-6
            text-surface-500 dark:text-surface-400"
        >
          Set up the academic year your school is currently
          operating in, then add its academic periods and fee
          schedules.
        </p>

        <EduToolFeesManagerAddAcademicYear class="mt-6">
          <Button
            label="Start Academic Year"
            icon="pi pi-plus"
            type="button"
          />
        </EduToolFeesManagerAddAcademicYear>
      </div>

      <!-- ------------------------------------------------------------------ -->
      <!-- Current academic year -->
      <!-- ------------------------------------------------------------------ -->
      <section
        v-if="currentAcademicYear"
        class="space-y-5"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-widest
              text-primary-600 dark:text-primary-400"
          >
            Current Academic Year
          </p>

          <h2
            class="mt-1 text-xl font-bold
              text-surface-900 dark:text-surface-0"
          >
            {{ currentAcademicYear.label }}
          </h2>

          <p
            class="mt-1 text-sm text-surface-500
              dark:text-surface-400"
          >
            Manage the school's current academic schedule,
            periods, and fees.
          </p>
        </div>

        <EduToolFeesManagerCurrentAcademicYear
          :academic-year="currentAcademicYear"
          @deleted="refresh"
        />
      </section>

      <!-- ------------------------------------------------------------------ -->
      <!-- No current year but historical years exist -->
      <!-- ------------------------------------------------------------------ -->
      <section
        v-else-if="pastAcademicYears.length"
        class="space-y-5"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-widest
              text-primary-600 dark:text-primary-400"
          >
            Current Academic Year
          </p>

          <h2
            class="mt-1 text-xl font-bold
              text-surface-900 dark:text-surface-0"
          >
            No current academic year
          </h2>

          <p
            class="mt-1 text-sm text-surface-500
              dark:text-surface-400"
          >
            Start the academic year the school is currently
            operating in to continue.
          </p>
        </div>

        <EduToolFeesManagerAddAcademicYear>
          <Button
            label="Start Academic Year"
            icon="pi pi-plus"
            type="button"
          />
        </EduToolFeesManagerAddAcademicYear>
      </section>

      <!-- ------------------------------------------------------------------ -->
      <!-- Past academic years -->
      <!-- ------------------------------------------------------------------ -->
      <section
        v-if="pastAcademicYears.length"
        class="space-y-5"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-widest
              text-surface-500 dark:text-surface-400"
          >
            Past Academic Years
          </p>

          <h2
            class="mt-1 text-xl font-bold
              text-surface-900 dark:text-surface-0"
          >
            Academic history
          </h2>

          <p
            class="mt-1 text-sm text-surface-500
              dark:text-surface-400"
          >
            View previous academic schedules and their periods.
          </p>
        </div>

        <div class="space-y-6">
          <EduToolFeesManagerAcademicYear
            v-for="year in pastAcademicYears"
            :key="year.id"
            :academic-year="year"
            @deleted="refresh"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped></style>