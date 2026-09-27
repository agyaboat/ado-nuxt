<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const route = useRoute()
const studentsStore = useFeesManagerStudentsStore()
const classesStore = useFeesManagerClassesStore()

const accessId = computed(() => route.params.access_id as string)

const search = ref('')
const selectedClass = ref<string | null>(null)
const selectedAccommodation = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)

const selectedStudent = ref<Student | null>(null)
const previewVisible = ref(false)

const classOptions = computed(() => {
  return classesStore.classes.flatMap((schoolClass) => {
    if (schoolClass.variants?.length) {
      return schoolClass.variants
    }

    return [schoolClass]
  })
})

const accommodationOptions = [
  {
    value: 'day',
    label: "Day"
  },
  {
    value: 'boarding',
    label: "Boarding"
  },
]

const statusOptions = [
  // wire actual values later
  {
    value: 'active',
    label: "Active"
  },
  {
    value: 'stopped',
    label: "Stopped"
  },
]

const hasFilters = computed(() => {
  return (
    Boolean(search.value) ||
    Boolean(selectedClass.value) ||
    Boolean(selectedAccommodation.value) ||
    Boolean(selectedStatus.value)
  )
})

async function fetchStudents(page = 1) {
  studentsStore.setFilters({
    search: search.value.trim(),
    classId: selectedClass.value,
    accommodation: selectedAccommodation.value,
    status: selectedStatus.value,
  })

  await studentsStore.fetchStudents(accessId.value, page)
}

function clearFilters() {
  search.value = ''
  selectedClass.value = null
  selectedAccommodation.value = null
  selectedStatus.value = null

  fetchStudents()
}

function handleStudentDeleted() {
  selectedStudent.value = null
  previewVisible.value = false
}
function previewStudent(student: Student) {
  selectedStudent.value = student
  previewVisible.value = true
}

function onPage(event: { page: number; rows: number }) {
  studentsStore.fetchStudents(
    accessId.value,
    event.page + 1,
    event.rows,
  )
}

watch(
  [search, selectedClass, selectedAccommodation, selectedStatus],
  () => {
    fetchStudents()
  },
)

onMounted(async () => {
  await classesStore.check(accessId.value)
  await studentsStore.check(accessId.value)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-end">
      <div class="flex gap-5">
        <EduToolFeesManagerUploadStudents />
        <EduToolFeesManagerAddStudent />
      </div>
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
              placeholder="Search students..."
            />
          </IconField>

          <Select
            v-model="selectedClass"
            :options="classOptions"
            option-label="label"
            option-value="id"
            placeholder="Class"
            show-clear
          />

          <Select
            v-model="selectedAccommodation"
            :options="accommodationOptions"
            option-label="label"
            option-value="value"
            placeholder="Accommodation"
            show-clear
          />

          <Select
            v-model="selectedStatus"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Status"
            show-clear
          />

          <Button
            v-if="hasFilters"
            label="Clear"
            type="button"
            severity="secondary"
            text
            @click="clearFilters"
          />
        </div>
      </div>
    </details>

    <!-- Students -->
    <div
      class="overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-800 dark:bg-surface-900"
    >
      <DataTable
        :value="studentsStore.students"
        data-key="id"
        row-hover
        :loading="studentsStore.loading"
        class="cursor-pointer"
        lazy
        paginator
        :rows="studentsStore.pagination?.perPage ?? 20"
        :total-records="studentsStore.pagination?.total ?? 0"
        :rows-per-page-options="[10, 25, 50]"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} of {totalRecords}"
        @page="onPage"
        @row-click="({ data }) => previewStudent(data)"
      >
        <Column
          field="admissionNumber"
          header="Admission No."
        />

        <Column
          field="firstName"
          header="Student"
        >
          <template #body="{ data }">
            <p class="font-semibold text-surface-900 dark:text-surface-0">
              {{ data.firstName }}
              {{ data.middleName ? `${data.middleName} ` : '' }}
              {{ data.lastName }}
            </p>
          </template>
        </Column>

        <Column
          field="class.label"
          header="Class"
        >
          <template #body="{ data }">
            {{ data.class?.label ?? '—' }}
          </template>
        </Column>

        <Column
          field="residentialStatus"
          header="Accommodation"
        />

        <Column
          field="studentStatus"
          header="Status"
        >
          <template #body="{ data }">
            <Tag
              :value="data.studentStatus"
              :severity="
                data.studentStatus === 'active'
                  ? 'success'
                  : 'secondary'
              "
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="previewVisible"
      modal
      header="Student Viewer"
      :style="{ width: '42rem' }"
    >
      <EduToolFeesManagerStudentView
        v-if="selectedStudent"
        :student="selectedStudent"
        @deleted="handleStudentDeleted"
      />
    </Dialog>
  </div>
</template>