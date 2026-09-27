<script setup lang="ts">
const props = defineProps<{
  academicYear: AcademicYear
  period: AcademicPeriod
}>()

const academicScheduleStore =
  useFeesManagerAcademicScheduleStore()

const route = useRoute()

const accessId = computed(() => {
  return route.params.access_id as string
})

const isCurrent = computed(() => {
  return props.period.id === academicScheduleStore.currentPeriod
})

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function openPeriod() {
  navigateTo({
    name: 'fees_manager.schedule.period',
    params: {
      access_id: accessId.value,
      period_id: props.period.id,
    },
  })
}
</script>

<template>
  <div
    class="flex cursor-pointer items-center gap-5 px-6 py-5
      transition-colors hover:bg-surface-50
      dark:hover:bg-surface-800/50"
    @click="openPeriod"
  >
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-3">
        <h3
          class="font-semibold
            text-surface-900 dark:text-surface-0"
        >
          {{ period.label }}
        </h3>

        <Tag
          v-if="isCurrent"
          value="Current"
          severity="success"
        />
      </div>

      <p
        class="mt-1 text-sm text-surface-500
          dark:text-surface-400"
      >
        {{ formatDate(period.startsAt) }}
        —
        {{ formatDate(period.endsAt) }}
      </p>
    </div>

    <i
      class="pi pi-chevron-right shrink-0
        text-surface-400"
    />
  </div>
</template>

<style scoped></style>