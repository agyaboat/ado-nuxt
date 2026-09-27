<script setup lang="ts">
import { computed, watch } from 'vue'

definePageMeta({
  name: 'fees_manager.schedule.period',
})

const route = useRoute()

const accessStore = useFeesManagerAccessStore()
const periodStore = useFeesManagerAcademicPeriodStore()

const { access } = storeToRefs(accessStore)


const {
  period,
  year,
  feeSchedules,
  loading,
  error,
  hasClasses,
} = storeToRefs(periodStore)

const canEdit = computed(() => {
  if (!period.value) {
    return false
  }

  const currentAcademicPeriodId =
    access.value?.school.currentAcademicPeriod?.id

  if (!currentAcademicPeriodId) {
    return false
  }

  if (period.value.id !== currentAcademicPeriodId) {
    return false
  }

  const today = new Date()
  const startsAt = new Date(period.value.startsAt)
  const endsAt = new Date(period.value.endsAt)

  return today >= startsAt && today <= endsAt
})

const accessId = computed(() => {
  return String(route.params.access_id)
})

const periodId = computed(() => {
  return String(route.params.period_id)
})

const isCurrent = computed(() => {
  return (
    access.value?.school.currentAcademicPeriod?.id ===
    period.value?.id
  )
})

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
}

function isApplied(schedule: {
  meta: {
    lastAppliedAt: string | null
  } | null
}) {
  return Boolean(schedule.meta?.lastAppliedAt)
}

function handleConfigure(
  row: {
    class: {
      id: string
      label: string
    }
    day: unknown
    boarding: unknown
  },
  accommodationType: 'day' | 'boarding',
) {
  console.log(
    'Configure',
    row.class.id,
    accommodationType,
  )
}

function handleUpdate(schedule: {
  id: string
}) {
  console.log('Update', schedule.id)
}

function handleApply(schedule: {
  id: string
}) {
  console.log('Apply', schedule.id)
}

/*
|--------------------------------------------------------------------------
| Load
|--------------------------------------------------------------------------
*/

watch(
  [accessId, periodId],
  async ([newAccessId, newPeriodId]) => {
    if (!newAccessId || !newPeriodId) {
      return
    }

    await periodStore.check(
      newAccessId,
      newPeriodId,
    )
  },
  {
    immediate: true,
  },
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
          Loading academic period...
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

    <!-- Period -->
    <template v-else-if="period">
      <!-- Breadcrumb -->
      <Breadcrumb
        :model="[
          {
            label: 'Academic Schedule',
            route: {
              name: 'fees_manager.academic-schedule',
              params: {
                access_id: accessId,
              },
            },
          },
          {
            label: year?.label,
          },
          {
            label: period.label,
          },
        ]"
        class="mb-0 bg-inherit p-0"
      >
        <template #item="{ item, props }">
          <NuxtLink
            v-if="item.route"
            :to="item.route"
            v-bind="props.action"
            class="font-semibold"
          >
            {{ item.label }}
          </NuxtLink>

          <span
            v-else
            class="text-surface-700 dark:text-surface-0"
          >
            {{ item.label }}
          </span>
        </template>
      </Breadcrumb>

      <!-- School -->
      <EduToolFeesManagerContentSchoolName />

      <!-- Period -->
      <div
        class="flex flex-col gap-4 sm:flex-row
          sm:items-end sm:justify-between"
      >
        <div>
          <div class="flex items-center gap-3">
            <h1
              class="text-3xl font-black tracking-tight
                text-surface-900 dark:text-surface-0"
            >
              {{ period.label }}
            </h1>

            <Tag
              v-if="isCurrent"
              value="Current"
              severity="success"
            />
          </div>

          <div
            class="mt-2 flex items-center gap-3 text-sm
              text-surface-500 dark:text-surface-400"
          >
            <span>
              {{ year?.label }}
            </span>

            <span>•</span>

            <span>
              {{
                new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(period.startsAt))
              }}

              —

              {{
                new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(period.endsAt))
              }}
            </span>
          </div>
        </div>

        <EduToolFeesManagerUpdateAcademicPeriod
          :academic-year="year!"
          :period="period"
          @updated="periodStore.refresh()"
        />
      </div>

      <!-- No classes -->
      <div
        v-if="!hasClasses"
        class="rounded-2xl border border-dashed
          border-surface-300 px-6 py-14 text-center
          dark:border-surface-700"
      >
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center
            rounded-xl bg-surface-100 text-surface-500
            dark:bg-surface-800 dark:text-surface-300"
        >
          <span class="material-symbols-outlined">
            school
          </span>
        </div>

        <h2
          class="mt-4 text-lg font-bold
            text-surface-900 dark:text-surface-0"
        >
          No classes yet
        </h2>

        <p
          class="mx-auto mt-1 max-w-md text-sm
            text-surface-500 dark:text-surface-400"
        >
          Add classes first before configuring fee schedules
          for this academic period.
        </p>
      </div>

      <!-- Fee schedules -->
      <section
        v-else
        class="space-y-4"
      >
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">
              Fee Schedules
            </h2>

            <p class="mt-1 text-sm text-surface-500">
              Configure the fees for each class for this academic period.
            </p>
          </div>

          <EduToolFeesManagerSynchronizeFeeSchedules
            v-if="canEdit"
            :access-id="accessId"
            :academic-period-id="period.id"
            @synchronized="periodStore.refresh()"
          />
        </div>

        <div
          class="overflow-hidden rounded-2xl border
            border-surface-200 bg-surface-0
            dark:border-surface-700 dark:bg-surface-900"
        >
          <DataTable
            :value="feeSchedules"
            size="small"
            tableStyle="min-width: 30rem"
          >
            <!-- Class -->
            <Column header="Class">
              <template #body="{ data }">
                <span
                  class="font-semibold text-surface-900
                    dark:text-surface-0"
                >
                  {{ data.class.label }}
                </span>
              </template>
            </Column>

            <!-- Day -->
            <Column header="Day">
              <template #body="{ data }">
                <div v-if="data.day">
                  <div class="flex items-center gap-3">
                    <span
                      class="font-medium text-surface-900
                        dark:text-surface-0"
                    >
                      {{ formatMoney(data.day.amount) }}
                    </span>

                    <EduToolFeesManagerFeeUpdate
                      v-if="canEdit"
                      :fee="data.day"
                      :accommodation-type="'day'"
                      :school-class="data.class"
                      :period="period"
                      @updated="periodStore.refresh()"
                    >
                    <Button
                      icon="pi pi-pencil"
                      severity="secondary"
                      size="small"
                      variant="text"
                      type="button"
                      @click="handleUpdate(data.day)"
                    />
                  </EduToolFeesManagerFeeUpdate>
                  </div>
                </div>

                <EduToolFeesManagerConfigureFee
                  v-else-if="canEdit && !data.day"
                  :school-class="data.class"
                  accommodation-type="day"
                  :period="period"
                  @created="periodStore.refresh()"
                >
                  <Button
                    label="Add Fee"
                    icon="pi pi-plus"
                    severity="secondary"
                    text
                    size="small"
                    type="button"
                  />
                </EduToolFeesManagerConfigureFee>

                <div v-else> — </div>
              </template>
            </Column>

            <!-- Boarding -->
            <Column header="Boarding">
              <template #body="{ data }">
                <div v-if="data.boarding">
                  <div class="flex items-center gap-3">
                    <span
                      class="font-medium text-surface-900
                        dark:text-surface-0"
                    >
                      {{ formatMoney(data.boarding.amount) }}
                    </span>

                   <EduToolFeesManagerFeeUpdate
                      v-if="canEdit"
                      :fee="data.boarding"
                      :accommodation-type="'boarding'"
                      :school-class="data.class"
                      :period="period"
                      @updated="periodStore.refresh()"
                    >
                    <Button
                      icon="pi pi-pencil"
                      severity="secondary"
                      size="small"
                      variant="text"
                      type="button"
                      @click="handleUpdate(data.day)"
                    />
                  </EduToolFeesManagerFeeUpdate>
                  </div>
                </div>

                <EduToolFeesManagerConfigureFee
                  v-else-if="canEdit && !data.boarding"
                  :school-class="data.class"
                  accommodation-type="boarding"
                  :period="period"
                  @created="periodStore.refresh()"
                >
                  <Button
                    label="Add Fee"
                    icon="pi pi-plus"
                    severity="secondary"
                    text
                    size="small"
                    type="button"
                  />
                </EduToolFeesManagerConfigureFee>

                <div v-else> — </div>
              </template>
            </Column>

            <template #empty>
              <div class="px-6 py-12 text-center">
                <p
                  class="text-sm text-surface-500
                    dark:text-surface-400"
                >
                  No fee schedules available.
                </p>
              </div>
            </template>
          </DataTable>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
</style>