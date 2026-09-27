<script setup lang="ts">
import { computed, ref, watch } from 'vue'

definePageMeta({
  name: 'fees_manager',
})

const accessStore = useFeesManagerAccessStore()
const academicScheduleStore =
  useFeesManagerAcademicScheduleStore()
const dashboardStore = useFeesManagerDashboardStore()

const { access } = storeToRefs(accessStore)

const {
  currentAcademicYear,
  pastAcademicYears,
  currentPeriod,
  loading: academicScheduleLoading,
  error: academicScheduleError,
} = storeToRefs(academicScheduleStore)

const {
  data,
  loading: dashboardLoading,
  error: dashboardError,
} = storeToRefs(dashboardStore)

const accessId = computed(
  () => access.value?.access.id ?? null
)

/*
|--------------------------------------------------------------------------
| Academic years
|--------------------------------------------------------------------------
|
| The schedule store intentionally separates the current
| academic year from past academic years.
|
| The dashboard selector, however, needs one combined list.
|
*/

const allAcademicYears = computed(() => {
  return [
    ...(currentAcademicYear.value
      ? [currentAcademicYear.value]
      : []),
    ...pastAcademicYears.value,
  ]
})

/*
|--------------------------------------------------------------------------
| Academic period selection
|--------------------------------------------------------------------------
*/

const selectedAcademicPeriodId =
  ref<string | null>(null)

const groupedPeriods = computed(() => {
  return allAcademicYears.value
    .filter((year) => year.periods.length > 0)
    .map((year) => ({
      label: year.label,
      value: year.id,
      items: year.periods.map((period) => ({
        label: period.label,
        value: period.id,
      })),
    }))
})

const hasAcademicPeriods = computed(
  () => groupedPeriods.value.length > 0
)

/*
|--------------------------------------------------------------------------
| Financial statistics
|--------------------------------------------------------------------------
*/

const stats = computed(() => {
  const financial = data.value.financial

  return [
    {
      label: 'Expected',
      value: `GHS ${financial.expected.toLocaleString()}`,
      icon: 'payments',
      tone: 'amber',
    },
    {
      label: 'Collected',
      value: `GHS ${financial.collected.toLocaleString()}`,
      icon: 'account_balance_wallet',
      tone: 'emerald',
    },
    {
      label: 'Outstanding',
      value: `GHS ${financial.outstanding.toLocaleString()}`,
      icon: 'pending_actions',
      tone: 'slate',
    },
    {
      label: 'Collection Rate',
      value: `${financial.collectionRate}%`,
      icon: 'percent',
      tone: 'emerald',
    },
  ]
})

/*
|--------------------------------------------------------------------------
| Student payment statistics
|--------------------------------------------------------------------------
*/

const studentStats = computed(() => {
  const students = data.value.students

  return [
    {
      label: 'Paid in full',
      value: students.paidInFull.toLocaleString(),
      icon: 'check_circle',
      tone: 'emerald',
    },
    {
      label: 'Partially paid',
      value: students.partiallyPaid.toLocaleString(),
      icon: 'timelapse',
      tone: 'amber',
    },
    {
      label: 'Outstanding',
      value: students.outstanding.toLocaleString(),
      icon: 'error_outline',
      tone: 'slate',
    },
  ]
})

/*
|--------------------------------------------------------------------------
| Selected academic period label
|--------------------------------------------------------------------------
*/

const currentPeriodLabel = computed(() => {
  if (!selectedAcademicPeriodId.value) {
    return 'No current period'
  }

  const period = allAcademicYears.value
    .flatMap((year) => year.periods)
    .find(
      (period) =>
        period.id === selectedAcademicPeriodId.value
    )

  return period?.label ?? 'No current period'
})

/*
|--------------------------------------------------------------------------
| Load academic context
|--------------------------------------------------------------------------
*/

watch(
  accessId,
  async (id) => {
    if (!id) {
      selectedAcademicPeriodId.value = null
      academicScheduleStore.clear()
      dashboardStore.clear()
      return
    }

    selectedAcademicPeriodId.value = null

    const loaded =
      await academicScheduleStore.check(id)

    if (!loaded) {
      return
    }

    /*
     * Prefer the school's current academic period
     * as the initial dashboard context.
     */
    if (currentPeriod.value) {
      const periodExists = allAcademicYears.value
        .flatMap((year) => year.periods)
        .some(
          (period) =>
            period.id === currentPeriod.value
        )

      if (periodExists) {
        selectedAcademicPeriodId.value =
          currentPeriod.value
      }
    }
  },
  {
    immediate: true,
  },
)

/*
|--------------------------------------------------------------------------
| Load dashboard for selected period
|--------------------------------------------------------------------------
*/

watch(
  [accessId, selectedAcademicPeriodId],
  async ([id, periodId]) => {
    if (!id || !periodId) {
      dashboardStore.clear()
      return
    }

    await dashboardStore.check(id, periodId)
  },
)
</script>

<template>
  <div class="relative">
    <!-- Academic context loading -->
    <div
      v-if="academicScheduleLoading"
      class="flex min-h-[60vh] items-center justify-center"
    >
      <div class="flex flex-col items-center gap-4">
        <ProgressSpinner
          stroke-width="4"
          class="h-10 w-10"
        />

        <p
          class="text-sm font-medium text-surface-500 dark:text-surface-400"
        >
          Loading academic periods...
        </p>
      </div>
    </div>

    <!-- Academic context error -->
    <div
      v-else-if="academicScheduleError"
      class="flex min-h-[60vh] items-center justify-center"
    >
      <Message
        severity="error"
        :closable="false"
        class="max-w-lg"
      >
        {{ academicScheduleError }}
      </Message>
    </div>

    <!-- Dashboard -->
    <div
      v-else
      class="space-y-10"
    >
      <!-- Header -->
      <div
        class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1
            class="mt-2 text-3xl font-black tracking-tight
              text-surface-900 dark:text-surface-0"
          >
            Dashboard
          </h1>

          <EduToolFeesManagerContentSchoolName />
        </div>

        <!-- Academic period selector -->
        <div
          v-if="hasAcademicPeriods"
          class="flex flex-col gap-1"
        >
          <Select
            v-model="selectedAcademicPeriodId"
            :options="groupedPeriods"
            option-label="label"
            option-value="value"
            option-group-label="label"
            option-group-children="items"
            placeholder="Select academic period"
            class="w-full sm:w-56"
            :disabled="dashboardLoading"
            :pt="{
              list: {
                class: 'p-0!',
              },
              optionGroup: {
                class:
                  'border-b border-surface rounded-none',
              },
            }"
          />

          <span
            v-if="
              dashboardStore.data.academicYearLabel
            "
            class="text-sm text-muted-color"
          >
            {{ dashboardStore.data.academicYearLabel }}
            Academic Year
          </span>
        </div>

        <!-- No periods -->
        <Button
          v-else
          label="No current period"
          icon="pi pi-chevron-down"
          icon-pos="right"
          severity="secondary"
          variant="outlined"
          disabled
        />
      </div>

      <!-- Dashboard error -->
      <Message
        v-if="dashboardError"
        severity="error"
        :closable="false"
      >
        {{ dashboardError }}
      </Message>

      <!-- No academic periods -->
      <Message
        v-if="!hasAcademicPeriods"
        severity="info"
        :closable="false"
      >
        No academic periods have been configured for
        this school yet.
      </Message>

      <!-- Financial summary -->
      <div
        class="overflow-hidden rounded-2xl border border-surface-200
          bg-surface-0 shadow-sm dark:border-surface-800 dark:bg-surface-900"
      >
        <div
          class="flex items-center justify-between border-b border-surface-200
            px-6 py-4 dark:border-surface-800"
        >
          <div>
            <h2
              class="font-bold text-surface-900 dark:text-surface-0"
            >
              Financial Overview
            </h2>
          </div>

          <ProgressSpinner
            v-if="dashboardLoading"
            stroke-width="4"
            class="h-5 w-5"
          />
        </div>

        <div class="grid sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label"
            class="relative p-6"
            :class="[
              index < 3
                ? 'border-b border-surface-200 xl:border-b-0 xl:border-r dark:border-surface-800'
                : '',
              index === 2
                ? 'sm:border-r sm:border-surface-200 dark:sm:border-surface-800'
                : '',
            ]"
          >
            <div
              class="flex items-start justify-between"
            >
              <div
                class="flex h-11 w-11 items-center justify-center rounded-xl"
                :class="{
                  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400':
                    stat.tone === 'amber',

                  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400':
                    stat.tone === 'emerald',

                  'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-300':
                    stat.tone === 'slate',
                }"
              >
                <span
                  class="material-symbols-outlined text-[22px]"
                >
                  {{ stat.icon }}
                </span>
              </div>
            </div>

            <p
              class="mt-5 text-sm font-medium text-surface-500
                dark:text-surface-400"
            >
              {{ stat.label }}
            </p>

            <p
              class="mt-1 text-2xl font-black tracking-tight
                text-surface-800 dark:text-surface-0"
            >
              {{ stat.value }}
            </p>
          </div>
        </div>
      </div>

      <!-- Student position -->
      <div>
        <div class="mb-4">
          <h2
            class="text-lg font-black tracking-tight
              text-surface-900 dark:text-surface-0"
          >
            Student Payment Position
          </h2>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <div
            v-for="student in studentStats"
            :key="student.label"
            class="group relative overflow-hidden rounded-2xl border
              border-surface-200 bg-surface-0 p-6 shadow-sm
              transition-shadow hover:shadow-md
              dark:border-surface-800 dark:bg-surface-900"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                :class="{
                  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400':
                    student.tone === 'emerald',

                  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400':
                    student.tone === 'amber',

                  'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-300':
                    student.tone === 'slate',
                }"
              >
                <span
                  class="material-symbols-outlined"
                >
                  {{ student.icon }}
                </span>
              </div>

              <div>
                <p
                  class="text-sm font-medium text-surface-500
                    dark:text-surface-400"
                >
                  {{ student.label }}
                </p>

                <p
                  class="mt-1 text-3xl font-black tracking-tight
                    text-surface-900 dark:text-surface-0"
                >
                  {{ student.value }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>