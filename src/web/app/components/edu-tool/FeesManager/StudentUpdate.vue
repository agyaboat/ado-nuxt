<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Option {
  label: string
  value: string
}

const props = defineProps<{
  student: Student
}>()

const emit = defineEmits<{
  updated: [student: Student]
}>()
const route = useRoute()
const api = useAdoFetch()
const classesStore = useFeesManagerClassesStore()
const studentsStore = useFeesManagerStudentsStore()
const toast = useToast()

const visible = ref(false)
const submitting = ref(false)

const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const admissionNumber = ref('')
const selectedClass = ref<string | null>(null)
selectedClass.value = props.student.class?.id ?? null
const accommodation = ref<string | null>(null)
const gender = ref<string | null>(null)
const phone = ref('')
const email = ref('')

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

const status = ref<string | null>(null)

const statusOptions: Option[] = [
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'stopped',
    label: 'Stopped',
  },
]

// status.value = props.student.studentStatus

const canSubmit = computed(() => {
  return (
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    Boolean(selectedClass.value) &&
    Boolean(accommodation.value)
  )
})

function syncForm() {
  firstName.value = props.student.firstName
  middleName.value = props.student.middleName ?? ''
  lastName.value = props.student.lastName
  admissionNumber.value = props.student.admissionNumber ?? ''
  selectedClass.value = props.student.class?.id ?? null
  accommodation.value = props.student.residentialStatus ?? null
  gender.value = props.student.gender ?? null
  phone.value = props.student.phone ?? ''
  email.value = props.student.email ?? ''
  status.value = props.student.studentStatus
}

watch(
  () => props.student,
  () => {
    syncForm()
  },
  { immediate: true },
)

function open() {
  syncForm()
  visible.value = true
}

function close() {
  if (submitting.value) return

  visible.value = false
}

async function submit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/students/${props.student.id}`,
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
          studentStatus: status.value,
        }),
        query: {
          _method: 'PATCH',
        },
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to update student',
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })
      return
    }

    emit('updated', result.data)
    await studentsStore.fetchStudents(accessId.value)

    toast.add({
      severity: 'success',
      summary: 'Student updated',
      detail: `${firstName.value.trim()} ${lastName.value.trim()} was updated successfully.`,
      life: 3000,
    })

    visible.value = false
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: 'Unable to update the student.',
      life: 5000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <span @click="open">
    <slot>
      <Button
        label="Edit"
        icon="pi pi-pencil"
        severity="secondary"
        outlined
        size="small"
        @click.stop="open"
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    :header="`Edit ${student.firstName} ${student.lastName}`"
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

          <div>
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

          <div>
            <label
              for="student-status"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Status
            </label>

            <Select
              id="student-status"
              v-model="status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Select status"
              class="w-full"
            />
          </div>
        </div>
      </div>

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
          label="Save Changes"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>