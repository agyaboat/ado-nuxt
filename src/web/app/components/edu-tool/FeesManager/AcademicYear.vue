<script setup lang="ts">

const props = defineProps<{
  academicYear: AcademicYear
}>()

const emit = defineEmits<{
  deleted: []
}>()

// const academicYearsStore = useFeesManagerAcademicYearsStore()

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

const canAddPeriod = computed(() => {
  return periodCount.value < periodLimit.value
})

const schemeLabel = computed(() => {
  return props.academicYear.periodScheme === 'semester'
    ? 'Semester'
    : 'Trimester'
})

// function formatDate(date: string) {
//   return new Intl.DateTimeFormat('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   }).format(new Date(date))
// }

// function periodStatus(period: AcademicPeriod) {
//   if (period.id === academicYearsStore.currentPeriod) {
//     return 'Current'
//   }

//   const now = new Date()
//   const endsAt = new Date(period.endsAt)
//   const startsAt = new Date(period.startsAt)

//   if (endsAt < now) {
//     return 'Past'
//   }

//   if (startsAt > now) {
//     return 'Upcoming'
//   }

//   return 'Current'
// }

// function periodSeverity(period: AcademicPeriod) {
//   const status = periodStatus(period)

//   if (status === 'Current') {
//     return 'success'
//   }

//   if (status === 'Past') {
//     return 'secondary'
//   }

//   return 'info'
// }

// function viewPeriod(periodId: string) {
//   console.log('View period', periodId)
// }

function deleteYear() {
  if (hasPeriods.value) {
    return
  }

  emit('deleted')
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
      class="flex flex-col gap-4 border-b border-surface-200
        px-6 py-5 sm:flex-row sm:items-center sm:justify-between
        dark:border-surface-700"
    >
      <div class="flex flex-wrap items-center gap-3">
        <h2
          class="text-xl font-black tracking-tight
            text-surface-900 dark:text-surface-0"
        >
          {{ academicYear.label }}
        </h2>

        <span
          class="text-sm text-surface-500
            dark:text-surface-400"
        >
          {{ schemeLabel }}
        </span>
      </div>

      <div class="flex items-center justify-between gap-5 flex-wrap">
        <EduToolFeesManagerUpdateAcademicYear
          :academic-year="academicYear"
        >
          <Button
            label="Update"
            icon="pi pi-pencil"
            severity="secondary"
            size="small"
            type="button"
          />
        </EduToolFeesManagerUpdateAcademicYear>
      </div>
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

    <!-- Empty periods -->
    <div
      v-else
      class="px-6 py-10 text-center"
    >
      <p
        class="text-sm text-surface-500
          dark:text-surface-400"
      >
        No academic periods yet.
      </p>

      <div class="mt-4 flex items-center justify-center gap-3">
        <!-- <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          text
          size="small"
          type="button"
          @click="deleteYear"
        /> -->
        <EduToolFeesManagerDeleteAcademicYear
          :academic-year="academicYear"
          @deleted="$emit('deleted')"
        />
        <EduToolFeesManagerAddAcademicPeriod
          v-if="canAddPeriod"
          :academic-year="academicYear"
        >
          <Button
            label="Add Period"
            icon="pi pi-plus"
            text
            size="small"
            type="button"
          />
        </EduToolFeesManagerAddAcademicPeriod>
      </div>
    </div>

    <!-- Add period -->
    <div
      v-if="hasPeriods && canAddPeriod"
      class="flex justify-between border-t border-surface-200
        px-6 py-4 dark:border-surface-700"
    >
      <p
        class="mt-1 text-sm text-surface-500
          dark:text-surface-400"
      >
        {{ periodCount }} of {{ periodLimit }} periods
      </p>
      <EduToolFeesManagerAddAcademicPeriod
        :academic-year="academicYear"
      >
        <Button
          label="Add Period"
          icon="pi pi-plus"
          severity="secondary"
          size="small"
          type="button"
        />
      </EduToolFeesManagerAddAcademicPeriod>
    </div>
  </div>
</template>