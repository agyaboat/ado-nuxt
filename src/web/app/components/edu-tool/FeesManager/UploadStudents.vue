<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import * as XLSX from 'xlsx'

interface ImportStudent {
  firstName: string
  middleName: string | null
  lastName: string
  admissionNumber: string
  gender: string | null
  residentialStatus: string
  arrearsAmount: number
  arrearsNote: string | null
}

interface PreviewRow {
  rowNumber: number
  student: ImportStudent
  errors: string[]
}

interface ExcelRow {
  [key: string]: unknown
}

const emit = defineEmits<{
  imported: [
    payload: {
      classId: string
      students: ImportStudent[]
      uploadId: string
    },
  ]
}>()

const route = useRoute()

const accessId = route.params.access_id as string

const classesStore = useFeesManagerClassesStore()

const {
  selectableClasses,
  loading: classesLoading,
  error: classesError,
} = storeToRefs(classesStore)

/*
|--------------------------------------------------------------------------
| Drawer
|--------------------------------------------------------------------------
*/

const visible = ref(false)

/*
|--------------------------------------------------------------------------
| Class
|--------------------------------------------------------------------------
*/

const selectedClassId = ref<string | null>(null)

const classOptions = computed(() =>
  selectableClasses.value.map((schoolClass) => ({
    label: schoolClass.label,
    value: schoolClass.id,
  })),
)

const selectedClass = computed(() =>
  selectableClasses.value.find(
    (schoolClass) =>
      schoolClass.id === selectedClassId.value,
  ) ?? null,
)

/*
|--------------------------------------------------------------------------
| File
|--------------------------------------------------------------------------
*/

const fileInput = ref<HTMLInputElement | null>(null)

const selectedFile = ref<File | null>(null)

/*
|--------------------------------------------------------------------------
| Structure / Preview
|--------------------------------------------------------------------------
*/

const showStructure = ref(false)

const previewRows = ref<PreviewRow[]>([])

const totalRows = ref(0)

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const parsing = ref(false)

const submitting = ref(false)

const error = ref<string | null>(null)

/*
|--------------------------------------------------------------------------
| Capacity
|--------------------------------------------------------------------------
*/

const currentStudentCount = computed(
  () => selectedClass.value?.studentCount ?? 0,
)

const remainingCapacity = computed(() =>
  Math.max(
    100 - currentStudentCount.value,
    0,
  ),
)

const exceedsClassCapacity = computed(
  () => totalRows.value > remainingCapacity.value,
)

/*
|--------------------------------------------------------------------------
| Preview state
|--------------------------------------------------------------------------
*/

const validRows = computed(() =>
  previewRows.value.filter(
    (row) => row.errors.length === 0,
  ),
)

const invalidRows = computed(() =>
  previewRows.value.filter(
    (row) => row.errors.length > 0,
  ),
)

const hasPreview = computed(
  () => previewRows.value.length > 0,
)

/*
|--------------------------------------------------------------------------
| Submit
|--------------------------------------------------------------------------
*/

const canSubmit = computed(() =>
  Boolean(
    selectedClassId.value &&
      hasPreview.value &&
      totalRows.value <= 100 &&
      !exceedsClassCapacity.value &&
      invalidRows.value.length === 0 &&
      !parsing.value &&
      !submitting.value,
  ),
)

/*
|--------------------------------------------------------------------------
| Accepted Excel structure
|--------------------------------------------------------------------------
*/

const acceptedColumns = [
  {
    name: 'Full Name',
    required: true,
    description:
      'Alternative to First Name, Middle Name and Last Name. One name becomes First Name; two names become First Name and Last Name; three or more names become First Name, Middle Name(s) and Last Name.',
  },
  {
    name: 'First Name',
    required: true,
    description:
      'Student first name. Required when Full Name is not provided.',
  },
  {
    name: 'Middle Name',
    required: false,
    description:
      'Student middle name(s).',
  },
  {
    name: 'Last Name',
    required: true,
    description:
      'Student last name. Required when Full Name is not provided.',
  },
  {
    name: 'Admission Number',
    required: true,
    description:
      'Unique admission number for the student. It must not already belong to another student in this school.',
  },
  {
    name: 'Gender',
    required: false,
    description:
      'Student gender.',
  },
  {
    name: 'Residential Status',
    required: true,
    description:
      'Student residential status. Accepted values are Day or Boarding.',
  },
  {
    name: 'Arrears',
    required: false,
    description:
      'Previous outstanding balance in GHS.',
  },
  {
    name: 'Arrears Note',
    required: false,
    description:
      'Optional note describing the previous arrears.',
  },
]

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await classesStore.check(accessId)
})

/*
|--------------------------------------------------------------------------
| Drawer actions
|--------------------------------------------------------------------------
*/

function open() {
  visible.value = true
  error.value = null
}

function close() {
  visible.value = false
}

function resetImport() {
  selectedFile.value = null
  previewRows.value = []
  totalRows.value = 0
  error.value = null
}

function chooseDifferentFile() {
  resetImport()
  openFilePicker()
}

/*
|--------------------------------------------------------------------------
| Excel helpers
|--------------------------------------------------------------------------
*/

function normalizeHeader(
  value: unknown,
): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function stringValue(
  value: unknown,
): string {
  return String(value ?? '').trim()
}

function nullableString(
  value: unknown,
): string | null {
  const valueString = stringValue(value)

  return valueString || null
}

function getCell(
  row: ExcelRow,
  columnName: string,
): unknown {
  const target = normalizeHeader(columnName)

  const key = Object.keys(row).find(
    (key) =>
      normalizeHeader(key) === target,
  )

  return key !== undefined
    ? row[key]
    : undefined
}

function hasColumn(
  rows: ExcelRow[],
  columnName: string,
): boolean {
  const firstRow = rows[0]

  if (!firstRow) {
    return false
  }

  const target = normalizeHeader(columnName)

  return Object.keys(firstRow).some(
    (key) =>
      normalizeHeader(key) === target,
  )
}

/*
|--------------------------------------------------------------------------
| Name parsing
|--------------------------------------------------------------------------
|
| John
| -> firstName: John
|
| John Mensah
| -> firstName: John
| -> lastName: Mensah
|
| John Kofi Mensah
| -> firstName: John
| -> middleName: Kofi
| -> lastName: Mensah
|
| John Kofi Kwame Mensah
| -> firstName: John
| -> middleName: Kofi Kwame
| -> lastName: Mensah
|
*/

function parseFullName(
  value: unknown,
): {
  firstName: string
  middleName: string | null
  lastName: string
} {
  const parts = stringValue(value)
    .split(/\s+/)
    .filter(Boolean)

  const firstName = parts[0] ?? ''

  if (parts.length === 1) {
    return {
      firstName,
      middleName: null,
      lastName: '',
    }
  }

  if (parts.length === 2) {
    return {
      firstName,
      middleName: null,
      lastName: parts[1] ?? '',
    }
  }

  return {
    firstName,
    middleName:
      parts.slice(1, -1).join(' ') || null,
    lastName: parts.at(-1) ?? '',
  }
}

/*
|--------------------------------------------------------------------------
| Amount parsing
|--------------------------------------------------------------------------
|
| Excel:
| 500
| 500.00
| GHS 500
| ₵500
| 1,500.50
|
*/

function parseAmount(
  value: unknown,
): number {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 0
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : 0
  }

  const normalized = String(value)
    .replace(/GHS/gi, '')
    .replace(/₵/g, '')
    .replace(/,/g, '')
    .trim()

  const amount = Number(normalized)

  return Number.isFinite(amount)
    ? amount
    : 0
}

function normalizeResidentialStatus(
  value: unknown,
): string {
  return stringValue(value).toLowerCase()
}

/*
|--------------------------------------------------------------------------
| Build normalized student
|--------------------------------------------------------------------------
*/

function buildStudent(
  row: ExcelRow,
): ImportStudent {
  const fullName = getCell(
    row,
    'Full Name',
  )

  let firstName = ''
  let middleName: string | null = null
  let lastName = ''

  if (stringValue(fullName)) {
    const parsed =
      parseFullName(fullName)

    firstName = parsed.firstName
    middleName = parsed.middleName
    lastName = parsed.lastName
  } else {
    firstName = stringValue(
      getCell(row, 'First Name'),
    )

    middleName = nullableString(
      getCell(row, 'Middle Name'),
    )

    lastName = stringValue(
      getCell(row, 'Last Name'),
    )
  }

  return {
    firstName,
    middleName,
    lastName,

    admissionNumber: stringValue(
      getCell(
        row,
        'Admission Number',
      ),
    ),

    gender: nullableString(
      getCell(row, 'Gender'),
    ),

    residentialStatus:
      normalizeResidentialStatus(
        getCell(
          row,
          'Residential Status',
        ),
      ),

    arrearsAmount: parseAmount(
      getCell(row, 'Arrears'),
    ),

    arrearsNote: nullableString(
      getCell(row, 'Arrears Note'),
    ),
  }
}

/*
|--------------------------------------------------------------------------
| Row validation
|--------------------------------------------------------------------------
*/

function validateStudent(
  student: ImportStudent,
): string[] {
  const errors: string[] = []

  if (!student.firstName) {
    errors.push(
      'First name is required.',
    )
  }

  if (!student.lastName) {
    errors.push(
      'Last name is required.',
    )
  }

  if (!student.admissionNumber) {
    errors.push(
      'Admission number is required.',
    )
  }

  if (!student.residentialStatus) {
    errors.push(
      'Residential status is required.',
    )
  } else if (
    !['day', 'boarding'].includes(
      student.residentialStatus,
    )
  ) {
    errors.push(
      'Residential status must be Day or Boarding.',
    )
  }

  if (student.arrearsAmount < 0) {
    errors.push(
      'Arrears cannot be negative.',
    )
  }

  return errors
}

/*
|--------------------------------------------------------------------------
| Duplicate admission numbers within file
|--------------------------------------------------------------------------
*/

function validateDuplicateAdmissionNumbers(
  rows: PreviewRow[],
) {
  const admissionNumbers = new Map<
    string,
    number[]
  >()

  for (const row of rows) {
    const admissionNumber =
      row.student.admissionNumber
        .trim()
        .toLowerCase()

    if (!admissionNumber) {
      continue
    }

    const occurrences =
      admissionNumbers.get(
        admissionNumber,
      ) ?? []

    occurrences.push(row.rowNumber)

    admissionNumbers.set(
      admissionNumber,
      occurrences,
    )
  }

  for (const row of rows) {
    const admissionNumber =
      row.student.admissionNumber
        .trim()
        .toLowerCase()

    if (!admissionNumber) {
      continue
    }

    const occurrences =
      admissionNumbers.get(
        admissionNumber,
      ) ?? []

    if (occurrences.length > 1) {
      row.errors.push(
        `Admission number is duplicated in rows ${occurrences.join(', ')}.`,
      )
    }
  }
}

/*
|--------------------------------------------------------------------------
| File picker
|--------------------------------------------------------------------------
*/

function openFilePicker() {
  error.value = null

  fileInput.value?.click()
}

async function handleFileSelected(
  event: Event,
) {
  const input =
    event.target as HTMLInputElement

  const file = input.files?.[0]

  if (!file) {
    return
  }

  selectedFile.value = file

  previewRows.value = []
  totalRows.value = 0
  error.value = null

  await parseFile(file)

  /*
   * Allow selecting the same file again.
   */
  input.value = ''
}

/*
|--------------------------------------------------------------------------
| Parse Excel
|--------------------------------------------------------------------------
*/

async function parseFile(
  file: File,
) {
  parsing.value = true
  error.value = null

  try {
    const extension = file.name
      .split('.')
      .pop()
      ?.toLowerCase()

    if (
      extension !== 'xlsx' &&
      extension !== 'xls'
    ) {
      error.value =
        'Please select an Excel file (.xlsx or .xls).'

      return
    }

    const buffer =
      await file.arrayBuffer()

    const workbook = XLSX.read(
      buffer,
      {
        type: 'array',
      },
    )

    const firstSheetName =
      workbook.SheetNames[0]

    if (!firstSheetName) {
      error.value =
        'The Excel file does not contain a worksheet.'

      return
    }

    const worksheet =
      workbook.Sheets[firstSheetName]

    if (!worksheet) {
      error.value =
        'Unable to read the first worksheet.'

      return
    }

    const rows =
      XLSX.utils.sheet_to_json<ExcelRow>(
        worksheet,
        {
          defval: '',
          raw: true,
        },
      )

    if (!rows.length) {
      error.value =
        'The selected worksheet does not contain any student rows.'

      return
    }

    totalRows.value =
      rows.length

    /*
     * Maximum upload size.
     */
    if (rows.length > 100) {
      error.value =
        'A single upload can contain a maximum of 100 students.'

      return
    }

    /*
     * Name structure.
     *
     * Either:
     *
     * Full Name
     *
     * OR:
     *
     * First Name + Last Name
     */
    const hasFullName =
      hasColumn(
        rows,
        'Full Name',
      )

    const hasFirstName =
      hasColumn(
        rows,
        'First Name',
      )

    const hasLastName =
      hasColumn(
        rows,
        'Last Name',
      )

    if (
      !hasFullName &&
      (!hasFirstName ||
        !hasLastName)
    ) {
      error.value =
        'The file must contain Full Name, or both First Name and Last Name.'

      return
    }

    /*
     * Admission Number is required.
     */
    if (
      !hasColumn(
        rows,
        'Admission Number',
      )
    ) {
      error.value =
        'The Admission Number column is required.'

      return
    }

    /*
     * Residential Status is required.
     */
    if (
      !hasColumn(
        rows,
        'Residential Status',
      )
    ) {
      error.value =
        'The Residential Status column is required.'

      return
    }

    /*
     * Normalize every row.
     */
    previewRows.value =
      rows.map(
        (row, index) => {
          const student =
            buildStudent(row)

          return {
            /*
             * Excel row 1 is the header.
             */
            rowNumber:
              index + 2,

            student,

            errors:
              validateStudent(
                student,
              ),
          }
        },
      )

    /*
     * Detect duplicate admission
     * numbers inside this upload.
     */
    validateDuplicateAdmissionNumbers(
      previewRows.value,
    )
  } catch (err) {
    console.error(err)

    error.value =
      'Unable to read the Excel file. Please check that it is a valid Excel workbook.'
  } finally {
    parsing.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Display helpers
|--------------------------------------------------------------------------
*/

function formatAmount(
  amount: number,
): string {
  return `GHS ${amount.toFixed(2)}`
}

function studentName(
  student: ImportStudent,
): string {
  return [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

/*
|--------------------------------------------------------------------------
| Submit
|--------------------------------------------------------------------------
*/

const toast = useToast()
const api = useAdoFetch()

async function submit() {
  if (!canSubmit.value || !selectedClassId.value) {
    return
  }

  submitting.value = true
  error.value = null

  try {
    const students = validRows.value.map((row) => row.student)

    const response = await api.post(`/edutools/fees_manager/${accessId}/students/upload`, {
      body: JSON.stringify({
        classId: selectedClassId.value,
        students,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      error.value = result.message ?? 'Unable to upload students.'
      toast.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: error.value,
        life: 4000,
      })
      return
    }

    toast.add({
      severity: 'success',
      summary: 'Upload queued',
      detail: result.message ?? 'Student upload has been queued.',
      life: 4000,
    })

    emit('imported', {
      classId: selectedClassId.value,
      students: students,
      uploadId: result.data.uploadId,
    })

    resetImport()
    visible.value = false
  } catch (err) {
    console.error('Student upload failed:', err)

    error.value = 'Unable to upload students. Please try again.'

    toast.add({
      severity: 'error',
      summary: 'Upload failed',
      detail: error.value,
      life: 4000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <!-- Trigger -->
  <slot :open="open">
    <Button
      label="Upload Students"
      icon="pi pi-upload"
      severity="secondary"
      type="button"
      @click="open"
    />
  </slot>

  <Drawer
    v-model:visible="visible"
    position="full"
    :show-close-icon="false"
    class="!bg-surface-50 dark:!bg-surface-950"
  >
    <!-- Header -->
    <template #header>
      <div
        class="flex w-full items-center gap-4"
      >
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          rounded
          type="button"
          aria-label="Close"
          @click="close"
        />

        <div>
          <div
            class="text-lg font-semibold text-surface-900 dark:text-surface-0"
          >
            Upload Students
          </div>

          <!-- <div
            class="text-sm text-surface-500"
          >
            Import students from an Excel
            workbook
          </div> -->
        </div>
      </div>
    </template>

    <div
      class="mx-auto flex min-h-full w-full max-w-6xl flex-col"
    >
      <div
        class="flex-1 space-y-10 pb-28"
      >
        <!-- Intro -->
        <div
          class="max-w-2xl"
        >
          <h1
            class="text-2xl font-semibold tracking-tight text-surface-900 dark:text-surface-0"
          >
            Import your student list
          </h1>

          <p
            class="mt-2 text-sm leading-6 text-surface-500"
          >
            Choose the class, upload your Excel
            file, and review the students before
            adding them to the school.
          </p>
        </div>

        <div class="flex justify-end">
          <EduToolFeesManagerPastUploads />
        </div>

        <!-- Step 1 -->
        <section>
          <div
            class="mb-4 flex items-start gap-3"
          >
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-contrast"
            >
              01
            </div>

            <div>
              <h2
                class="text-sm font-semibold text-surface-900 dark:text-surface-0"
              >
                Select class
              </h2>

              <p
                class="mt-0.5 text-xs text-surface-500"
              >
                Students from this file will be
                enrolled into this class.
              </p>
            </div>
          </div>

          <div
            class="ml-10 max-w-2xl"
          >
            <Select
              v-model="selectedClassId"
              :options="classOptions"
              option-label="label"
              option-value="value"
              placeholder="Select a class"
              :loading="classesLoading"
              :disabled="classesLoading"
              class="w-full"
            />

            <div
              v-if="selectedClass"
              class="mt-2 flex items-center justify-between text-xs text-surface-500"
            >
              <span>
                {{ selectedClass.studentCount }}
                current students
              </span>

              <span>
                {{ remainingCapacity }}
                places remaining
              </span>
            </div>

            <Message
              v-if="classesError"
              severity="error"
              :closable="false"
              class="mt-3"
            >
              {{ classesError }}
            </Message>
          </div>
        </section>

        <!-- Step 2 -->
        <section>
          <div
            class="mb-4 flex items-start gap-3"
          >
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-contrast"
            >
              02
            </div>

            <div>
              <h2
                class="text-sm font-semibold text-surface-900 dark:text-surface-0"
              >
                Upload Excel file
              </h2>

              <p
                class="mt-0.5 text-xs text-surface-500"
              >
                Use an Excel workbook containing
                your student records.
              </p>
            </div>
          </div>

          <div
            class="ml-10 max-w-4xl"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              class="hidden"
              @change="handleFileSelected"
            />

            <!-- Empty upload -->
            <button
              v-if="!selectedFile"
              type="button"
              class="group w-full rounded-2xl border border-dashed border-surface-300 bg-white px-6 py-12 text-center transition hover:border-primary hover:bg-primary-50/30 dark:border-surface-700 dark:bg-surface-900 dark:hover:border-primary dark:hover:bg-primary-950/20"
              :disabled="
                !selectedClassId ||
                classesLoading ||
                parsing
              "
              @click="openFilePicker"
            >
              <div
                class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-500 transition group-hover:bg-primary-100 group-hover:text-primary dark:bg-surface-800"
              >
                <i
                  class="pi pi-file-excel text-2xl"
                />
              </div>

              <div
                class="mt-5 text-sm font-semibold text-surface-900 dark:text-surface-0"
              >
                Select your Excel file
              </div>

              <div
                class="mt-1 text-sm text-surface-500"
              >
                Choose a .xlsx or .xls workbook
              </div>

              <div
                class="mt-5"
              >
                <span
                  class="inline-flex items-center gap-2 rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 dark:border-surface-600 dark:text-surface-200"
                >
                  <i class="pi pi-upload" />
                  Select Excel
                </span>
              </div>

              <div
                class="mt-5 text-xs text-surface-400"
              >
                Maximum 100 students
              </div>
            </button>

            <!-- Selected file -->
            <div
              v-else
              class="rounded-2xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900"
            >
              <div
                class="flex items-center gap-4 px-5 py-4"
              >
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary dark:bg-primary-950"
                >
                  <i
                    class="pi pi-file-excel text-lg"
                  />
                </div>

                <div
                  class="min-w-0 flex-1"
                >
                  <div
                    class="truncate text-sm font-medium text-surface-900 dark:text-surface-0"
                  >
                    {{ selectedFile.name }}
                  </div>

                  <div
                    class="mt-1 text-xs text-surface-500"
                  >
                    {{ totalRows }}
                    student{{ totalRows === 1 ? '' : 's' }}
                    detected
                  </div>
                </div>

                <Button
                  icon="pi pi-refresh"
                  label="Change"
                  severity="secondary"
                  text
                  size="small"
                  type="button"
                  :disabled="parsing"
                  @click="chooseDifferentFile"
                />
              </div>

              <div
                class="border-t border-surface-100 px-5 py-3 text-xs text-surface-500 dark:border-surface-800"
              >
                Excel workbook · Maximum 100
                students
              </div>
            </div>

            <!-- Structure -->
            <div class="mt-4">
              <button
                type="button"
                class="flex items-center gap-2 text-xs font-medium text-primary"
                @click="
                  showStructure =
                    !showStructure
                "
              >
                <i
                  class="pi"
                  :class="
                    showStructure
                      ? 'pi-chevron-down'
                      : 'pi-chevron-right'
                  "
                />

                View accepted columns
              </button>

              <div
                v-if="!showStructure"
                class="mt-3 flex flex-wrap gap-2"
              >
                <span
                  v-for="column in acceptedColumns"
                  :key="column.name"
                  class="rounded-md bg-surface-100 px-2.5 py-1 text-xs text-surface-600 dark:bg-surface-800 dark:text-surface-300"
                >
                  {{ column.name }}
                  <span
                    v-if="column.required"
                    class="ml-0.5 text-red-500"
                  >
                    *
                  </span>
                </span>
              </div>

              <div
                v-if="showStructure"
                class="mt-3 overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700"
              >
                <DataTable
                  :value="acceptedColumns"
                  size="small"
                  table-style="minWidth: 50rem"
                >
                  <Column
                    field="name"
                    header="Column"
                  >
                    <template
                      #body="{ data }"
                    >
                      <span
                        class="font-medium"
                      >
                        {{ data.name }}
                      </span>
                    </template>
                  </Column>

                  <Column
                    header="Requirement"
                  >
                    <template
                      #body="{ data }"
                    >
                      <span
                        class="text-xs font-medium"
                        :class="
                          data.required
                            ? 'text-red-600'
                            : 'text-surface-500'
                        "
                      >
                        {{
                          data.required
                            ? 'Required'
                            : 'Optional'
                        }}
                      </span>
                    </template>
                  </Column>

                  <Column
                    header="Details"
                  >
                    <template
                      #body="{ data }"
                    >
                      <span
                        class="text-xs text-surface-500"
                      >
                        {{ data.description }}
                      </span>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div>
          </div>
        </section>

        <!-- Error -->
        <Message
          v-if="error"
          severity="error"
          :closable="false"
          class="ml-10 max-w-4xl"
        >
          {{ error }}
        </Message>

        <!-- Parsing -->
        <div
          v-if="parsing"
          class="ml-10 flex max-w-4xl items-center gap-3 rounded-xl bg-surface-100 px-4 py-3 text-sm text-surface-600 dark:bg-surface-800 dark:text-surface-300"
        >
          <i
            class="pi pi-spin pi-spinner"
          />

          Reading your Excel file...
        </div>

        <!-- Step 3 -->
        <section
          v-if="hasPreview"
        >
          <div
            class="mb-4 flex items-start gap-3"
          >
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-contrast"
            >
              03
            </div>

            <div>
              <h2
                class="text-sm font-semibold text-surface-900 dark:text-surface-0"
              >
                Review students
              </h2>

              <p
                class="mt-0.5 text-xs text-surface-500"
              >
                Check the imported information
                before adding the students.
              </p>
            </div>
          </div>

          <div
            class="ml-10 max-w-6xl space-y-4"
          >
            <!-- Summary -->
            <div
              class="flex flex-wrap items-center gap-3"
            >
              <div
                class="rounded-lg bg-surface-100 px-3 py-2 dark:bg-surface-800"
              >
                <span
                  class="text-xs text-surface-500"
                >
                  Students
                </span>

                <span
                  class="ml-2 text-sm font-semibold"
                >
                  {{ totalRows }}
                </span>
              </div>

              <div
                class="rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950/30"
              >
                <span
                  class="text-xs text-green-700 dark:text-green-400"
                >
                  Ready
                </span>

                <span
                  class="ml-2 text-sm font-semibold text-green-700 dark:text-green-400"
                >
                  {{ validRows.length }}
                </span>
              </div>

              <div
                v-if="invalidRows.length"
                class="rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/30"
              >
                <span
                  class="text-xs text-red-700 dark:text-red-400"
                >
                  Issues
                </span>

                <span
                  class="ml-2 text-sm font-semibold text-red-700 dark:text-red-400"
                >
                  {{ invalidRows.length }}
                </span>
              </div>
            </div>

            <!-- Capacity -->
            <Message
              v-if="exceedsClassCapacity"
              severity="warn"
              :closable="false"
            >
              This class has
              {{ currentStudentCount }}
              students and can hold a maximum of
              100. This file contains
              {{ totalRows }}
              students, exceeding the
              {{ remainingCapacity }}
              remaining places.
            </Message>

            <!-- Preview -->
            <div
              class="overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900"
            >
              <DataTable
                :value="previewRows"
                scrollable
                scroll-height="480px"
                size="small"
                striped-rows
                table-style="minWidth: 50rem"
              >
                <Column header="#">
                  <template #body="{ data }">
                    <span
                      class="text-xs text-surface-400"
                    >
                      {{ data.rowNumber }}
                    </span>
                  </template>
                </Column>

                <Column header="Student">
                  <template
                    #body="{ data }"
                  >
                    <div>
                      <div
                        class="font-medium"
                      >
                        {{
                          studentName(
                            data.student,
                          )
                        }}
                      </div>
                    </div>
                  </template>
                </Column>

                <Column
                  header="Admission Number"
                >
                  <template
                    #body="{ data }"
                  >
                    <span
                      class="font-mono text-xs"
                    >
                      {{
                        data.student
                          .admissionNumber ||
                        '—'
                      }}
                    </span>
                  </template>
                </Column>

                <Column
                  header="Gender"
                >
                  <template
                    #body="{ data }"
                  >
                    {{
                      data.student
                        .gender ?? '—'
                    }}
                  </template>
                </Column>

                <Column
                  header="Residential Status"
                >
                  <template
                    #body="{ data }"
                  >
                    <span
                      class="capitalize"
                    >
                      {{
                        data.student
                          .residentialStatus ||
                        '—'
                      }}
                    </span>
                  </template>
                </Column>

                <Column
                  header="Arrears"
                >
                  <template
                    #body="{ data }"
                  >
                    {{
                      data.student
                        .arrearsAmount > 0
                        ? formatAmount(
                            data.student
                              .arrearsAmount,
                          )
                        : '—'
                    }}
                  </template>
                </Column>

                <Column
                  header="Validation"
                >
                  <template
                    #body="{ data }"
                  >
                    <div
                      v-if="
                        data.errors
                          .length
                      "
                      class="space-y-1 text-xs text-red-600"
                    >
                      <div
                        v-for="message in data.errors"
                        :key="message"
                      >
                        {{ message }}
                      </div>
                    </div>

                    <span
                      v-else
                      class="inline-flex items-center gap-1 text-xs font-medium text-green-600"
                    >
                      <i
                        class="pi pi-check-circle"
                      />

                      Ready
                    </span>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </section>
      </div>

      <!-- Sticky footer -->
      <div
        v-if="hasPreview"
        class="fixed bottom-0 left-0 right-0 border-t border-surface-200 bg-white/95 backdrop-blur dark:border-surface-700 dark:bg-surface-900/95"
      >
        <div
          class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4"
        >
          <div class="min-w-0">
            <div
              class="truncate text-sm font-medium"
            >
              {{
                selectedClass?.label ??
                'No class selected'
              }}
            </div>

            <div
              class="mt-0.5 text-xs text-surface-500"
            >
              {{ validRows.length }}
              student{{
                validRows.length === 1
                  ? ''
                  : 's'
              }}
              ready to import
            </div>
          </div>

          <div
            class="flex items-center gap-2"
          >
            <Button
              label="Choose Different File"
              severity="secondary"
              text
              type="button"
              @click="chooseDifferentFile"
            />

            <Button
              :label="`Import ${validRows.length} Students`"
              icon="pi pi-upload"
              type="button"
              :loading="submitting"
              :disabled="!canSubmit"
              @click="submit"
            />
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>