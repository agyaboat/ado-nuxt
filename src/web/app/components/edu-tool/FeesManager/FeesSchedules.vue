<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const route = useRoute()

const accessStore = useFeesManagerAccessStore()
const academicYearsStore = useFeesManagerAcademicYearsStore()
const classesStore = useFeesManagerClassesStore()
const feeSchedulesStore = useFeesManagerFeeSchedulesStore()

const accessId = computed(() => route.params.access_id as string)

const search = ref('')
const selectedPeriod = ref<string | null>(null)
const selectedClass = ref<string | null>(null)
const selectedAccommodation = ref<string | null>(null)

const selectedFee = ref<FeeSchedule | null>(null)
const feeDialogVisible = ref(false)

const academicPeriodOptions = computed(() => {
  return academicYearsStore.academicYears.flatMap((academicYear) => {
    return academicYear.periods.map((period) => ({
      id: period.id,
      label: `${academicYear.label} · ${period.label}`,
    }))
  })
})

interface Option {
  label: string
  id: string
}
const classOptions = computed<Option[]>(() => {
  return classesStore.classes.map((schoolClass) => ({
    label: schoolClass.label,
    id: schoolClass.id,
  }))
})

const accommodationOptions = [
  {
    value: 'day',
    label: 'Day',
  },
  {
    value: 'boarding',
    label: 'Boarding',
  },
]

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
}

async function fetchFeeSchedules(page = 1) {
  feeSchedulesStore.setFilters({
    search: search.value.trim(),
    academicPeriodId: selectedPeriod.value,
    classId: selectedClass.value,
    accommodation: selectedAccommodation.value,
  })

  await feeSchedulesStore.fetchFeeSchedules(
    accessId.value,
    page,
  )
}

function clearFilters() {
  search.value = ''
  selectedPeriod.value =
    accessStore.access?.school.currentAcademicPeriod?.id ?? null
  selectedClass.value = null
  selectedAccommodation.value = null

  fetchFeeSchedules()
}

function previewFee(fee: FeeSchedule) {
  selectedFee.value = fee
  feeDialogVisible.value = true
}

function closePreview() {
  selectedFee.value = null
  feeDialogVisible.value = true
}

function onPage(event: { page: number; rows: number }) {
  feeSchedulesStore.fetchFeeSchedules(
    accessId.value,
    event.page + 1,
    event.rows,
  )
}

onMounted(async () => {
  await Promise.all([
    accessStore.check(accessId.value),
    academicYearsStore.check(accessId.value),
    classesStore.check(accessId.value),
  ])

  selectedPeriod.value =
    accessStore.access?.school.currentAcademicPeriod?.id ?? null

  feeSchedulesStore.setFilters({
    academicPeriodId: selectedPeriod.value,
  })

  await feeSchedulesStore.check(accessId.value)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-end">
      <EduToolFeesManagerAddFee />
    </div>

    <!-- Filters -->
    <details>
      <summary class="cursor-pointer font-bold text-primary">
        Filters
      </summary>

      <div
        class="rounded-2xl border border-surface-200 bg-surface-0 p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900"
      >
        <div class="flex flex-wrap gap-5">
          <IconField>
            <InputIcon class="pi pi-search" />

            <InputText
              v-model="search"
              placeholder="Search fees..."
              class="w-full"
            />
          </IconField>

          <Select
            v-model="selectedPeriod"
            :options="academicPeriodOptions"
            option-label="label"
            option-value="id"
            placeholder="Academic Period"
            show-clear
            @change="fetchFeeSchedules()"
          />

          <Select
            v-model="selectedClass"
            :options="classOptions"
            option-label="label"
            option-value="id"
            placeholder="Class"
            show-clear
            @change="fetchFeeSchedules()"
          />

          <Select
            v-model="selectedAccommodation"
            :options="accommodationOptions"
            option-label="label"
            option-value="value"
            placeholder="Accommodation"
            show-clear
            @change="fetchFeeSchedules()"
          />

          <Button
            v-if="
              search ||
              selectedPeriod ||
              selectedClass ||
              selectedAccommodation
            "
            label="Clear"
            severity="secondary"
            text
            type="button"
            @click="clearFilters"
          />
        </div>
      </div>
    </details>

    <!-- Fee schedules -->
    <div
      class="overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-800 dark:bg-surface-900"
    >
      <DataTable
        :value="feeSchedulesStore.feeSchedules"
        data-key="id"
        row-hover
        :loading="feeSchedulesStore.loading"
        lazy
        paginator
        :rows="feeSchedulesStore.pagination?.perPage ?? 10"
        :total-records="feeSchedulesStore.pagination?.total ?? 0"
        :rows-per-page-options="[10, 25, 50]"
        current-page-report-template="{first}-{last} of {totalRecords}"
        class="cursor-pointer"
        @page="onPage"
        @row-click="({ data }) => previewFee(data)"
      >
        <Column header="Class">
          <template #body="{ data }">
            {{ data.class?.label ?? '—' }}
          </template>
        </Column>

        <Column header="Accommodation">
          <template #body="{ data }">
            <span class="capitalize">
              {{ data.accommodationType }}
            </span>
          </template>
        </Column>

        <Column header="Academic Period">
          <template #body="{ data }">
            {{ data.academicPeriod?.year?.label }}
            ·
            {{ data.academicPeriod?.label }}
          </template>
        </Column>

        <Column header="Amount">
          <template #body="{ data }">
            <span class="font-bold text-surface-900 dark:text-surface-0">
              {{ formatMoney(data.amount) }}
            </span>
          </template>
        </Column>

        <Column header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.status"
              :severity="
                data.status === 'active'
                  ? 'success'
                  : 'secondary'
              "
              class="capitalize"
            />
          </template>
        </Column>

        <Column
          header=""
          style="width: 4rem"
        >
          <template #body>
            <Button
              icon="pi pi-chevron-right"
              type="button"
              severity="secondary"
              text
              rounded
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Fee preview -->
    <Dialog
      v-model:visible="feeDialogVisible"
      modal
      :style="{ width: '34rem' }"
      header="Fee Schedule"
    >
      <EduToolFeesManagerFeeView
        v-if="selectedFee"
        :fee="selectedFee"
        @deleted="closePreview"
      />
    </Dialog>
  </div>
</template>