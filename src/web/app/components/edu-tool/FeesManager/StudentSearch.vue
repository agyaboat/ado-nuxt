<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

interface StudentSearchResult {
  id: string
  name: string
  admissionNumber: string | null
  class: {
    id: string
    label: string
  } | null
  outstandingAmount: number
}

interface BreakdownStudent {
  id: string
  label: string
  sublabel: string
  value: string
  outstandingAmount: number
}

const route = useRoute()
const api = useAdoFetch()

const visible = ref(false)

const searchQuery = ref('')
const searchResults = ref<StudentSearchResult[]>([])
const selectedStudent = ref<StudentSearchResult | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0

const accessId = computed(() => String(route.params.access_id))

const breakdownStudent = computed<BreakdownStudent | null>(() => {
  const student = selectedStudent.value

  if (!student) {
    return null
  }

  return {
    id: student.id,
    label: `${student.name} · ${student.admissionNumber ?? ''}`,
    sublabel: student.class?.label ?? '',
    value: student.id,
    outstandingAmount: student.outstandingAmount
  }
})

const hasQuery = computed(() => searchQuery.value.trim().length > 0)

const hasResults = computed(() => searchResults.value.length > 0)

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
}

function clearResults() {
  searchResults.value = []
  selectedStudent.value = null
  error.value = null
}

function scheduleSearch() {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }

  const query = searchQuery.value.trim()

  if (!query) {
    clearResults()
    loading.value = false
    return
  }

  searchTimer = setTimeout(() => {
    fetchStudents(query)
  }, 300)
}

async function fetchStudents(query: string) {
  const currentRequestId = ++requestId

  loading.value = true
  error.value = null
  selectedStudent.value = null

  try {
    const response = await api.get(
      `/edutools/fees_manager/${accessId.value}/students/search`,
      {
        query: {
          q: query,
        },
      },
    )

    const result = await response.json()

    if (currentRequestId !== requestId) {
      return
    }

    if (!response.ok) {
      searchResults.value = []
      error.value = result.message ?? 'Unable to search students.'
      return
    }

    searchResults.value = (result.data ?? []).map(
      (student: StudentSearchResult) => ({
        id: student.id,
        name: student.name,
        admissionNumber: student.admissionNumber ?? null,
        class: student.class ?? null,
        outstandingAmount: student.outstandingAmount ?? 0,
      }),
    )
  } catch {
    if (currentRequestId !== requestId) {
      return
    }

    searchResults.value = []
    error.value = 'Unable to search students.'
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

function selectStudent(student: StudentSearchResult) {
  selectedStudent.value = student
}

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

function reset() {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }

  requestId++

  searchQuery.value = ''
  searchResults.value = []
  selectedStudent.value = null
  loading.value = false
  error.value = null
}

function handleDialogHide() {
  reset()
}

watch(searchQuery, () => {
  scheduleSearch()
})

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

defineExpose({
  open,
  close,
})
</script>

<template>
  <Button
    icon="pi pi-search"
    text
    rounded
    severity="secondary"
    type="button"
    aria-label="Search student"
    @click="open"
  />

  <Dialog
    v-model:visible="visible"
    modal
    header="Search Student"
    :style="{ width: '42rem' }"
    :breakpoints="{ '640px': '95vw' }"
    @hide="handleDialogHide"
  >
    <div class="space-y-5">
      <!-- Search -->
      <div>
        <label
          for="fees-manager-student-search"
          class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
        >
          Student
        </label>

        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-search" />
          </InputGroupAddon>

          <InputText
            id="fees-manager-student-search"
            v-model="searchQuery"
            placeholder="Search by name or admission number"
            autocomplete="off"
            class="w-full"
            autofocus
          />

          <InputGroupAddon v-if="loading">
            <i class="pi pi-spin pi-spinner" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <!-- Error -->
      <Message
        v-if="error"
        severity="error"
        :closable="false"
      >
        {{ error }}
      </Message>

      <!-- Results -->
      <div
        v-if="hasQuery"
        class="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800"
      >
        <div
          v-if="loading && !hasResults"
          class="flex items-center justify-center px-4 py-8 text-sm text-surface-500"
        >
          <i class="pi pi-spin pi-spinner mr-2" />
          Searching students...
        </div>

        <div
          v-else-if="!loading && !hasResults && !error"
          class="px-4 py-8 text-center text-sm text-surface-500"
        >
          No students found.
        </div>

        <button
          v-for="student in searchResults"
          :key="student.id"
          type="button"
          class="cursor-pointer flex w-full items-center justify-between gap-4 border-b border-surface-200 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-900"
          @click="selectStudent(student)"
        >
          <div class="min-w-0">
            <p
              class="truncate font-semibold text-surface-900 dark:text-surface-0"
            >
              {{ student.name }}
            </p>

            <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-surface-500">
              <span>
                {{ student.admissionNumber ?? 'No admission number' }}
              </span>

              <span
                v-if="student.class"
                aria-hidden="true"
              >
                ·
              </span>

              <span v-if="student.class">
                {{ student.class.label }}
              </span>
            </div>
          </div>

          <div class="shrink-0 text-right">
            <p class="text-xs text-surface-500">
              Outstanding
            </p>

            <p
              class="mt-0.5 font-bold"
              :class="
                student.outstandingAmount > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              "
            >
              {{ formatMoney(student.outstandingAmount) }}
            </p>
          </div>
        </button>
      </div>

      <!-- Selected student -->
      <div
        v-if="selectedStudent"
        class="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-800 dark:bg-surface-900"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p
              class="text-lg font-bold text-surface-900 dark:text-surface-0"
            >
              {{ selectedStudent.name }}
            </p>

            <p class="mt-1 text-sm text-surface-500">
              {{ selectedStudent.admissionNumber ?? 'No admission number' }}
              <span v-if="selectedStudent.class">
                · {{ selectedStudent.class.label }}
              </span>
            </p>
          </div>

          <Button
            icon="pi pi-times"
            text
            rounded
            severity="secondary"
            type="button"
            aria-label="Clear selected student"
            @click="selectedStudent = null"
          />
        </div>

        <div
          class="mt-5 rounded-xl bg-white px-4 py-4 dark:bg-surface-950"
        >
          <p class="text-sm font-medium text-surface-500">
            Total outstanding
          </p>

          <p
            class="mt-1 text-3xl font-black tracking-tight"
            :class="
              selectedStudent.outstandingAmount > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-emerald-600 dark:text-emerald-400'
            "
          >
            {{ formatMoney(selectedStudent.outstandingAmount) }}
          </p>
        </div>

        <div class="mt-5 flex items-center justify-between gap-3">
          <Message
            v-if="selectedStudent.outstandingAmount === 0"
            severity="info"
            :closable="false"
            class="m-0 flex-1"
          >
            This student has no outstanding arrears.
          </Message>

          <EduToolFeesManagerArrearsBreakdown
            v-if="breakdownStudent"
            :student="breakdownStudent"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>