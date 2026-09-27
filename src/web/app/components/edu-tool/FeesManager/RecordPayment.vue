<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Option {
  label: string
  value: string
}

interface StudentOption {
  label: string
  sublabel: string
  value: string
  outstandingAmount: number
}

const emit = defineEmits<{
  created: []
}>()

const route = useRoute()
const api = useAdoFetch()

const visible = ref(false)
const submitting = ref(false)

const selectedClass = ref<string | null>(null)
const selectedVariant = ref<string | null>(null)
const selectedStudent = ref<string | null>(null)

const students = ref<StudentOption[]>([])
const studentsLoading = ref(false)
const studentsError = ref<string | null>(null)

const amount = ref<number | null>(null)
const paymentMethod = ref<string | null>(null)
const paidAt = ref<Date>(new Date())

const paidBy = ref({
  name: '',
  phone: '',
  email: '',
})

const reference = ref('')
const notes = ref('')

const classesStore = useFeesManagerClassesStore()

const accessId = computed(() => String(route.params.access_id))

const classOptions = computed<Option[]>(() => {
  return classesStore.classes.map((schoolClass) => ({
    label: schoolClass.label,
    value: schoolClass.id,
  }))
})

const selectedClassRecord = computed(() => {
  return (
    classesStore.classes.find(
      (schoolClass) => schoolClass.id === selectedClass.value,
    ) ?? null
  )
})

const hasVariants = computed(() => {
  return Boolean(selectedClassRecord.value?.variants?.length)
})

const variantOptions = computed<Option[]>(() => {
  return (
    selectedClassRecord.value?.variants?.map((variant) => ({
      label: variant.label,
      value: variant.id,
    })) ?? []
  )
})

const actualClassId = computed(() => {
  return selectedVariant.value ?? selectedClass.value
})

watch(
  () => actualClassId.value,
  (newClassId) => {
    selectedStudent.value = null
    students.value = []
    amount.value = null
    studentsError.value = null

    if (newClassId) {
      fetchStudents()
    }
  },
)

const selectedStudentRecord = computed(() => {
  return (
    students.value.find(
      (student) => student.value === selectedStudent.value,
    ) ?? null
  )
})

const outstandingAmount = computed(() => {
  return selectedStudentRecord.value?.outstandingAmount ?? 0
})

const paymentMethodOptions: Option[] = [
  {
    label: 'Cash',
    value: 'cash',
  },
  {
    label: 'Bank Transfer',
    value: 'bank_transfer',
  },
  {
    label: 'Cheque',
    value: 'cheque',
  },
  {
    label: 'Mobile Money',
    value: 'mobile_money',
  },
  {
    label: 'Other',
    value: 'other',
  },
]

const canSubmit = computed(() => {
  return (
    Boolean(actualClassId.value) &&
    Boolean(selectedStudent.value) &&
    amount.value !== null &&
    amount.value > 0 &&
    Boolean(paymentMethod.value) &&
    Boolean(paidAt.value) &&
    paidBy.value.name.trim().length > 0
  )
})

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
}

async function fetchStudents() {
  const classId = actualClassId.value

  if (!classId) {
    students.value = []
    return
  }

  studentsLoading.value = true
  studentsError.value = null

  try {
    const response = await api.get(
      `/edutools/fees_manager/${accessId.value}/students/${classId}`,
    )

    const result = await response.json()

    if (!response.ok) {
      studentsError.value =
        result.message ?? 'Unable to load students.'
      students.value = []
      return
    }

    students.value = (result.data ?? []).map((student: any) => ({
      label: `${student.name} · ${student.admissionNumber}`,
      sublabel: student.class?.label ?? '',
      value: student.id,
      outstandingAmount: student.outstandingAmount ?? 0,
    }))
  } catch {
    studentsError.value = 'Unable to load students.'
    students.value = []
  } finally {
    studentsLoading.value = false
  }
}

function handleClassChange() {
  selectedVariant.value = null
  selectedStudent.value = null
  amount.value = null
}

function handleVariantChange() {
  selectedStudent.value = null
  amount.value = null
}

function handleStudentChange() {
  amount.value = null
}

async function open() {
  await classesStore.check(accessId.value)

  visible.value = true
}

function reset() {
  selectedClass.value = null
  selectedVariant.value = null
  selectedStudent.value = null

  students.value = []
  studentsError.value = null

  amount.value = null
  paymentMethod.value = null
  paidAt.value = new Date()

  paidBy.value = {
    name: '',
    phone: '',
    email: '',
  }

  reference.value = ''
  notes.value = ''
}

function close() {
  if (submitting.value) {
    return
  }

  visible.value = false
  reset()
}

const toast = useToast()

async function submit() {
  if (!canSubmit.value || submitting.value) {
    return
  }

  submitting.value = true

  try {
    const payload = {
      studentId: selectedStudent.value,
      amount: Math.round(amount.value! * 100),
      paymentMethod: paymentMethod.value,
      paidAt: paidAt.value,
      meta: {
        paidBy: {
          name: paidBy.value.name.trim(),
          phone: paidBy.value.phone.trim() || null,
          email: paidBy.value.email.trim() || null,
        },
        reference: reference.value.trim() || null,
        notes: notes.value.trim() || null,
      },
    }

    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/payments`,
      {
        body: JSON.stringify(payload),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to record payment',
        detail: result.message ?? 'Unable to record payment.',
        life: 4000,
      })

      return
    }

    toast.add({
      severity: 'success',
      summary: 'Payment recorded',
      detail: result.message ?? 'Payment recorded successfully.',
      life: 4000,
    })

    emit('created')
    useFeesManagerArrearsStore().refresh()

    visible.value = false
    reset()
  } catch (error) {
    console.error('Failed to record payment:', error)

    toast.add({
      severity: 'error',
      summary: 'Unable to record payment',
      detail: 'Something went wrong while recording the payment.',
      life: 4000,
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
    label="Record Payment"
    icon="pi pi-plus"
    type="button"
    @click="open"
  />

  <Dialog
    v-model:visible="visible"
    modal
    header="Record Payment"
    :style="{ width: '38rem' }"
    :closable="!submitting"
    :close-on-escape="!submitting"
  >
    <form
      class="space-y-6"
      @submit.prevent="submit"
    >
      <!-- Student Selection -->
      <div class="space-y-5">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Class -->
          <div>
            <label
              for="payment-class"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Class
            </label>

            <Select
              id="payment-class"
              v-model="selectedClass"
              :options="classOptions"
              option-label="label"
              option-value="value"
              placeholder="Select class"
              class="w-full"
              @change="handleClassChange"
            />
          </div>

          <!-- Variant -->
          <div v-if="hasVariants">
            <label
              for="payment-variant"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Variant
            </label>

            <Select
              id="payment-variant"
              v-model="selectedVariant"
              :options="variantOptions"
              option-label="label"
              option-value="value"
              placeholder="Select variant"
              :disabled="!selectedClass"
              class="w-full"
              @change="handleVariantChange"
            />
          </div>
        </div>

        <!-- Student -->
        <div>
          <label
            for="payment-student"
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Student
          </label>

          <Select
            id="payment-student"
            v-model="selectedStudent"
            :options="students"
            option-label="label"
            option-value="value"
            placeholder="Search and select student"
            filter
            filter-placeholder="Search student"
            empty-message="No students found"
            :loading="studentsLoading"
            :disabled="!actualClassId || studentsLoading"
            class="w-full"
            @change="handleStudentChange"
          >
            <template #option="{ option }">
              <div class="flex flex-col">
                <span class="font-medium">
                  {{ option.label }}
                </span>

                <span
                  v-if="option.sublabel"
                  class="mt-0.5 text-xs text-surface-500"
                >
                  {{ option.sublabel }}
                </span>
              </div>
            </template>
          </Select>

          <Message
            v-if="studentsError"
            severity="error"
            :closable="false"
            class="mt-3"
          >
            {{ studentsError }}
          </Message>
        </div>
      </div>

      <!-- Arrears Summary -->
      <div
        v-if="selectedStudentRecord"
        class="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-800 dark:bg-surface-900"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p
              class="text-sm font-medium text-surface-500 dark:text-surface-400"
            >
              Outstanding arrears
            </p>

            <p
              class="mt-1 text-2xl font-black tracking-tight text-surface-900 dark:text-surface-0"
            >
              {{ formatMoney(outstandingAmount) }}
            </p>
          </div>

          <EduToolFeesManagerArrearsBreakdown
            :student="selectedStudentRecord"
          />
        </div>
      </div>

      <!-- No Arrears -->
      <Message
        v-if="selectedStudentRecord && outstandingAmount === 0"
        severity="info"
        :closable="false"
      >
        This student has no outstanding arrears.
      </Message>

      <!-- Payment Details -->
      <div
        v-if="selectedStudentRecord"
        class="space-y-5"
      >
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <!-- Amount -->
          <div>
            <label
              for="payment-amount"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Amount
            </label>

            <InputNumber
              id="payment-amount"
              v-model="amount"
              mode="currency"
              currency="GHS"
              locale="en-GH"
              :min="0"
              :max="outstandingAmount / 100"
              class="w-full"
              input-class="w-full"
            />
          </div>

          <!-- Payment Method -->
          <div>
            <label
              for="payment-method"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Payment Method
            </label>

            <Select
              id="payment-method"
              v-model="paymentMethod"
              :options="paymentMethodOptions"
              option-label="label"
              option-value="value"
              placeholder="Select method"
              class="w-full"
            />
          </div>
        </div>

        <!-- Paid At -->
        <div>
          <label
            for="payment-paid-at"
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Paid At
          </label>

          <DatePicker
            id="payment-paid-at"
            v-model="paidAt"
            show-time
            hour-format="24"
            date-format="dd/mm/yy"
            class="w-full"
            input-class="w-full"
          />
        </div>
      </div>

      <!-- Paid By -->
      <div
        v-if="selectedStudentRecord"
        class="space-y-4"
      >
        <div>
          <h3 class="font-bold text-surface-900 dark:text-surface-0">
            Paid By
          </h3>

          <p class="mt-1 text-xs text-surface-500">
            Person who made the payment
          </p>
        </div>

        <div class="space-y-5">
          <div>
            <label
              for="paid-by-name"
              class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
            >
              Name
            </label>

            <InputText
              id="paid-by-name"
              v-model="paidBy.name"
              placeholder="Full name"
              class="w-full"
              autocomplete="off"
            />
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                for="paid-by-phone"
                class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
              >
                Phone
              </label>

              <InputText
                id="paid-by-phone"
                v-model="paidBy.phone"
                placeholder="024..."
                class="w-full"
                autocomplete="off"
              />
            </div>

            <div>
              <label
                for="paid-by-email"
                class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
              >
                Email
              </label>

              <InputText
                id="paid-by-email"
                v-model="paidBy.email"
                type="email"
                placeholder="name@example.com"
                class="w-full"
                autocomplete="off"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Details -->
      <div
        v-if="selectedStudentRecord"
        class="space-y-5"
      >
        <div>
          <label
            for="payment-reference"
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Reference
          </label>

          <InputText
            id="payment-reference"
            v-model="reference"
            placeholder="Receipt or reference number"
            class="w-full"
            autocomplete="off"
          />
        </div>

        <div>
          <label
            for="payment-notes"
            class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
          >
            Notes
          </label>

          <Textarea
            id="payment-notes"
            v-model="notes"
            rows="3"
            class="w-full"
            placeholder="Optional notes"
          />
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
          label="Record Payment"
          type="submit"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>