<script setup lang="ts">
const props = defineProps<{
  academicYear: AcademicYear
}>()

const emit = defineEmits<{
  deleted: []
}>()

const periodLimit = computed(() => {
  return props.academicYear.periodScheme === 'semester'
    ? 2
    : 3
})

const periodCount = computed(() => {
  return props.academicYear.periods.length
})

const hasPeriods = computed(() => {
  return periodCount.value > 0
})

const canStartPeriod = computed(() => {
  return periodCount.value < periodLimit.value
})

const schemeLabel = computed(() => {
  return props.academicYear.periodScheme === 'semester'
    ? 'Semester'
    : 'Trimester'
})

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}


const academicScheduleStore = useFeesManagerAcademicScheduleStore()

const route = useRoute()
const accessId = computed(() => {
  return route.params.access_id as string
})

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
  <div
    class="overflow-hidden rounded-2xl border
      border-surface-200 bg-surface-0
      dark:border-surface-700 dark:bg-surface-900"
  >
    <!-- Header -->
    <div
      class="flex justify-between items-center gap-4 border-b border-surface-200 px-6 py-5 dark:border-surface-700">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2
            class="text-xl font-black tracking-tight
              text-surface-900 dark:text-surface-0"
          >
            {{ academicYear.label }}
          </h2>
        </div>

        <div
          class="mt-2 flex flex-wrap items-center gap-x-3
            gap-y-1 text-sm text-surface-500
            dark:text-surface-400"
        >

          <span>
            {{ schemeLabel }}
          </span>
        </div>
      </div>

      <EduToolFeesManagerUpdateAcademicYear
        :academic-year="academicYear"
      >
        <Button
          label="Update Dates"
          icon="pi pi-calendar"
          severity="secondary"
          size="small"
          type="button"
        />
      </EduToolFeesManagerUpdateAcademicYear>
    </div>

    <!-- Periods -->
    <div
      v-if="hasPeriods"
      class="divide-y divide-surface-200
        dark:divide-surface-700"
    >
      <EduToolFeesManagerAcademicPeriod
        v-for="period in academicYear.periods"
        :key="period.id"
        :academic-year="academicYear"
        :period="period"
      />
    </div>

    <!-- First period -->
    <div
      v-else
      class="px-6 py-12 text-center"
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

      <h3
        class="mt-4 font-bold text-surface-900
          dark:text-surface-0"
      >
        Start an academic period
      </h3>

      <p
        class="mx-auto mt-1 max-w-md text-sm leading-6
          text-surface-500 dark:text-surface-400"
      >
        Start the first period of {{ academicYear.label }}
        to begin managing the school's academic schedule
        and fees.
      </p>

      <div
        class="mt-5 flex items-center justify-center gap-3"
      >
        <EduToolFeesManagerDeleteAcademicYear
          :academic-year="academicYear"
          @deleted="emit('deleted')"
        />

        <EduToolFeesManagerAddAcademicPeriod
          v-if="canStartPeriod"
          :academic-year="academicYear"
          @created="refresh"
        >
          <Button
            label="Start Academic Period"
            icon="pi pi-plus"
            type="button"
          />
        </EduToolFeesManagerAddAcademicPeriod>
      </div>
    </div>

    <!-- More periods -->
    <div
      v-if="hasPeriods && canStartPeriod"
      class="flex justify-end gap-4 border-t border-surface-200 px-6 py-4 dark:border-surface-700">
      <p
        class="text-sm text-surface-500
          dark:text-surface-400"
      >
        {{ periodCount }} of {{ periodLimit }} periods started
      </p>

    </div>
  </div>
</template>

<style scoped></style>