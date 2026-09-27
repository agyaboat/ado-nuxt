<script setup lang="ts">
import { computed, ref } from 'vue'

interface Option {
  label: string
  value: string
}

const route = useRoute()
const api = useAdoFetch()
const studentsStore = useFeesManagerStudentsStore()
const classesStore = useFeesManagerClassesStore()
const toast = useToast()
const dashboardStore = useFeesManagerDashboardStore()

const emit = defineEmits<{
  created: []
}>()

const visible = ref(false)
const submitting = ref(false)

const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const admissionNumber = ref('')

const selectedClass = ref<string | null>(null)
const accommodation = ref<string | null>(null)

const gender = ref<string | null>(null)
const phone = ref('')
const email = ref('')

const arrearsAmount = ref(0)
const arrearsNote = ref('')

const accessId = computed(() => route.params.access_id as string)

const classOptions = computed(() => {
  return classesStore.classes.flatMap((schoolClass) => {
    if (schoolClass.variants?.length) {
      return schoolClass.variants
    }

    return [schoolClass]
  })
})

const accommodationOptions: Option[] = [
  {
    value: 'day',
    label: 'Day',
  },
  {
    value: 'boarding',
    label: 'Boarding',
  },
]

const genderOptions: Option[] = [
  {
    value: 'male',
    label: 'Male',
  },
  {
    value: 'female',
    label: 'Female',
  },
]

const canSubmit = computed(() => {
  return (
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    Boolean(selectedClass.value) &&
    Boolean(accommodation.value)
  )
})

function open() {
  visible.value = true
}

function reset() {
  firstName.value = ''
  middleName.value = ''
  lastName.value = ''
  admissionNumber.value = ''
  selectedClass.value = null
  accommodation.value = null
  gender.value = null
  phone.value = ''
  email.value = ''
  arrearsAmount.value = 0
  arrearsNote.value = ''
}

function close() {
  if (submitting.value) return

  visible.value = false
  reset()
}

async function submit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/students`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.value.trim(),
          middleName: middleName.value.trim() || null,
          lastName: lastName.value.trim(),
          admissionNumber: admissionNumber.value.trim() || null,
          classId: selectedClass.value,
          residentialStatus: accommodation.value,
          gender: gender.value,
          phone: phone.value.trim() || null,
          email: email.value.trim() || null,
          arrearsAmount: arrearsAmount.value,
          arrearsNote: arrearsNote.value.trim() || null,
        }),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to add student',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })
      return
    }

    await studentsStore.fetchStudents(accessId.value)
    dashboardStore.refresh()

    toast.add({
      severity: 'success',
      summary: 'Student added',
      detail: `${firstName.value.trim()} ${lastName.value.trim()} was added successfully.`,
      life: 3000,
    })

    emit('created')

    visible.value = false
    reset()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: 'Unable to add the student.',
      life: 5000,
    })
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open,
})
</script>

<template>
  <Button
    label="Add Student"
    icon="pi pi-plus"
    type="button"
    @click="open"
  />

  <Dialog
    v-model:visible="visible"
    modal
    header="Add Student"
    :style="{ width: '42rem' }"
    :closable="!submitting"
    :close-on-escape="!submitting"
  >
    <form
      class="space-y-6"
      @submit.prevent="submit"
    >
      <!-- Student Information -->
      <div>
        <h4
          class="mb-4 text-sm font-semibold text-surface-800 dark:text-surface-100"
        >
          Student Information
        </h4>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              for="student-first-name"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              First name
            </label>

            <InputText
              id="student-first-name"
              v-model="firstName"
              placeholder="First name"
              class="w-full"
              autocomplete="given-name"
            />
          </div>

          <div>
            <label
              for="student-middle-name"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Middle name
            </label>

            <InputText
              id="student-middle-name"
              v-model="middleName"
              placeholder="Middle name"
              class="w-full"
              autocomplete="additional-name"
            />
          </div>

          <div>
            <label
              for="student-last-name"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Last name
            </label>

            <InputText
              id="student-last-name"
              v-model="lastName"
              placeholder="Last name"
              class="w-full"
              autocomplete="family-name"
            />
          </div>

          <div>
            <label
              for="student-admission-number"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Admission number
            </label>

            <InputText
              id="student-admission-number"
              v-model="admissionNumber"
              placeholder="Admission number"
              class="w-full"
              autocomplete="off"
            />
          </div>
        </div>
      </div>

      <!-- Current Enrollment -->
      <div>
        <h4
          class="mb-4 text-sm font-semibold text-surface-800 dark:text-surface-100"
        >
          Current Enrollment
        </h4>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              for="student-class"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Class
            </label>

            <Select
              id="student-class"
              v-model="selectedClass"
              :options="classOptions"
              option-label="label"
              option-value="id"
              placeholder="Select class"
              class="w-full"
            />
          </div>

          <div>
            <label
              for="student-accommodation"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Accommodation
            </label>

            <Select
              id="student-accommodation"
              v-model="accommodation"
              :options="accommodationOptions"
              option-label="label"
              option-value="value"
              placeholder="Select accommodation"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Extra Details -->
      <div>
        <h4
          class="mb-4 text-sm font-semibold text-surface-800 dark:text-surface-100"
        >
          Extra Details
        </h4>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              for="student-gender"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Gender
            </label>

            <Select
              id="student-gender"
              v-model="gender"
              :options="genderOptions"
              option-label="label"
              option-value="value"
              placeholder="Select gender"
              class="w-full"
            />
          </div>

          <div>
            <label
              for="student-phone"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Phone
            </label>

            <InputText
              id="student-phone"
              v-model="phone"
              placeholder="Phone number"
              class="w-full"
              autocomplete="tel"
            />
          </div>

          <div class="sm:col-span-2">
            <label
              for="student-email"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Email
            </label>

            <InputText
              id="student-email"
              v-model="email"
              type="email"
              placeholder="Email address"
              class="w-full"
              autocomplete="email"
            />
          </div>
        </div>
      </div>

      <!-- Previous Arrears -->
      <div
        class="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900/40"
      >
        <div class="mb-4">
          <h4
            class="text-sm font-semibold text-surface-800 dark:text-surface-100"
          >
            Previous Arrears
          </h4>

          <p
            class="mt-1 text-xs leading-relaxed text-surface-500 dark:text-surface-400"
          >
            Record any outstanding balance the student had before the school
            started using ScholarSaaS. This will be settled before current
            school fees when a payment is made.
          </p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              for="student-arrears-amount"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Arrears amount
            </label>

            <InputNumber
              id="student-arrears-amount"
              v-model="arrearsAmount"
              mode="currency"
              currency="GHS"
              locale="en-GH"
              :min="0"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
              class="w-full"
              input-class="w-full"
            />
          </div>

          <div>
            <label
              for="student-arrears-note"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Note
            </label>

            <InputText
              id="student-arrears-note"
              v-model="arrearsNote"
              placeholder="e.g. Balance from 2025/2026"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex justify-end gap-2 border-t border-surface-200 pt-5 dark:border-surface-800"
      >
        <Button
          label="Cancel"
          type="button"
          severity="secondary"
          outlined
          :disabled="submitting"
          @click="close"
        />

        <Button
          label="Add Student"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>