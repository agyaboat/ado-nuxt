<script setup lang="ts">
import { computed, watch } from 'vue'
// import type { ArrearsOrderBy } from '@/stores/edu-tool/fees-manager/arrears'
// import { jsPDF } from 'jspdf'
// import { autoTable } from 'jspdf-autotable'
import { downloadArrearsTablePdf } from '~/composables/edutools/fees-manager/arrears'

interface Option {
  label: string
  value: string
}

const route = useRoute()

const arrearsStore = useFeesManagerArrearsStore()
const classesStore = useFeesManagerClassesStore()

const accessId = computed(() => String(route.params.access_id))

const selectedClass = computed({
  get: () => arrearsStore.classId,
  set: (value: string | null) => {
    arrearsStore.setClass(value)
  },
})

const selectedVariant = computed({
  get: () => arrearsStore.variantId,
  set: (value: string | null) => {
    arrearsStore.setVariant(value)
  },
})

const selectedOrder = computed({
  get: () => arrearsStore.orderBy,
  set: (value: ArrearsOrderBy) => {
    arrearsStore.setOrderBy(value)
  },
})

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

const variantOptions = computed<Option[]>(() => {
  return (
    selectedClassRecord.value?.variants?.map((variant) => ({
      label: variant.label,
      value: variant.id,
    })) ?? []
  )
})

const hasVariants = computed(() => {
  return variantOptions.value.length > 0
})

const orderOptions: Option[] = [
  {
    label: 'Amount · Highest first',
    value: 'amount_desc',
  },
  {
    label: 'Amount · Lowest first',
    value: 'amount_asc',
  },
  {
    label: 'First name · A–Z',
    value: 'firstname_asc',
  },
  {
    label: 'First name · Z–A',
    value: 'firstname_desc',
  },
]

const totalArrears = computed(() => {
  return arrearsStore.students.reduce(
    (total, student) => total + student.outstandingAmount,
    0,
  )
})

const hasClassSelected = computed(() => {
  return Boolean(selectedClass.value)
})

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
}

async function loadArrears() {
  if (!selectedClass.value) {
    arrearsStore.clear()
    return
  }

  await arrearsStore.fetchArrears(accessId.value)
}

async function handleClassChange() {
  await loadArrears()
}

async function handleVariantChange() {
  await loadArrears()
}

async function handleOrderChange() {
  await loadArrears()
}

watch(
  () => accessId.value,
  async (newAccessId, oldAccessId) => {
    if (newAccessId === oldAccessId) {
      return
    }

    arrearsStore.initialize(newAccessId)

    await classesStore.check(newAccessId)
  },
  { immediate: true },
)

defineExpose({
  refresh: () => arrearsStore.fetchArrears(accessId.value, { force: true }),
})

function transformData(data: any) {
  return {
    label: data.name + (data.admissionNumber? ` • ${data.admissionNumber}`:''),
    sublabel: '',
    value: data.id,
    outstandingAmount: data.outstandingAmount
  }
}

function handleExportPdf() {
  if (!arrearsStore.students.length) {
    return
  }

  const classLabel =
    selectedClassRecord.value?.label ?? 'Selected Class'

  const variantLabel =
    selectedVariant.value
      ? (
          selectedClassRecord.value?.variants?.find(
            (variant) => variant.id === selectedVariant.value,
          )?.label ?? null
        )
      : null

  const safeClassLabel = classLabel
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  const safeVariantLabel = variantLabel
    ? variantLabel
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
    : null

  const filename = [
    'student-arrears',
    safeClassLabel,
    safeVariantLabel,
  ]
    .filter(Boolean)
    .join('-') + '.pdf'

  downloadArrearsTablePdf(
    arrearsStore.students,
    classLabel,
    variantLabel,
    filename,
  )
}
</script>

<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div
      class="flex flex-col gap-4 rounded-2xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-950 sm:flex-row sm:items-end"
    >
      <!-- Class -->
      <div class="min-w-0 flex-1">
        <label
          for="arrears-class"
          class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
        >
          Class
        </label>

        <Select
          id="arrears-class"
          v-model="selectedClass"
          :options="classOptions"
          option-label="label"
          option-value="value"
          placeholder="Select class"
          class="w-full"
          :loading="classesStore.loading"
          @change="handleClassChange"
        />
      </div>

      <!-- Variant -->
      <div
        v-if="hasVariants"
        class="min-w-0 flex-1"
      >
        <label
          for="arrears-variant"
          class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
        >
          Variant
        </label>

        <Select
          id="arrears-variant"
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

      <!-- Order -->
      <div class="min-w-0 flex-1">
        <label
          for="arrears-order"
          class="mb-2 block text-sm font-semibold text-surface-700 dark:text-surface-200"
        >
          Order by
        </label>

        <Select
          id="arrears-order"
          v-model="selectedOrder"
          :options="orderOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          @change="handleOrderChange"
        />
      </div>
    </div>

    <!-- Error -->
    <Message
      v-if="arrearsStore.error"
      severity="error"
      :closable="false"
    >
      {{ arrearsStore.error }}
    </Message>

    <!-- No class -->
    <div
      v-if="!hasClassSelected && !arrearsStore.loading"
      class="rounded-2xl border border-dashed border-surface-300 px-6 py-12 text-center dark:border-surface-700"
    >
      <i class="pi pi-users text-2xl text-surface-400" />

      <p class="mt-3 font-semibold text-surface-900 dark:text-surface-0">
        Select a class
      </p>

      <p class="mt-1 text-sm text-surface-500">
        Choose a class to view outstanding student arrears.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-else-if="arrearsStore.loading"
      class="rounded-2xl border border-surface-200 dark:border-surface-800"
    >
      <div class="flex items-center justify-center px-6 py-16 text-sm text-surface-500">
        <i class="pi pi-spin pi-spinner mr-2" />
        Loading arrears...
      </div>
    </div>

    <!-- Table -->
     <div v-else>
        <div class="flex justify-end p-1">
           <Button label="Refresh" variant="link" size="small" icon="pi pi-refresh" @click="loadArrears()" />
        </div>
        <div
         class="overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-800"
        >
         <!-- Table header -->
         <div
           class="flex gap-3 border-b border-surface-200 px-5 py-4 dark:border-surface-800 justify-between"
         >
   
           <div class="text-right">
             <p class="text-xs font-medium text-surface-500">
               Grand arrears
             </p>
   
             <p class="text-lg font-black text-surface-900 dark:text-surface-0">
               {{ formatMoney(totalArrears) }}
             </p>
           </div>
   
           <Button
             label="Export PDF"
             icon="pi pi-file-pdf"
             severity="secondary"
             outlined
             type="button"
             :disabled="!arrearsStore.students.length"
             @click="handleExportPdf"
           />
           <!-- <div class="">
           </div> -->
         </div>
   
         <!-- Empty -->
         <div
           v-if="!arrearsStore.students.length"
           class="px-6 py-16 text-center"
         >
           <i class="pi pi-check-circle text-2xl text-surface-400" />
   
           <p class="mt-3 font-semibold text-surface-900 dark:text-surface-0">
             No arrears found
           </p>
   
           <p class="mt-1 text-sm text-surface-500">
             There are no outstanding student arrears for this selection.
           </p>
         </div>
   
         <!-- Data -->
         <DataTable
           v-else
           :value="arrearsStore.students"
           table-style="minWidth: 50rem"
         >
           <Column
             header="Student"
           >
             <template #body="{ data }">
               <div>
                 <p class="font-semibold text-surface-900 dark:text-surface-0">
                   {{ data.name }}
                 </p>
   
                 <p class="mt-0.5 text-xs text-surface-500">
                   {{ data.admissionNumber ?? 'No admission number' }}
                 </p>
               </div>
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
             field="outstandingAmount"
             header="Grand arrears"
           >
             <template #body="{ data }">
               <span class="font-bold">
                 {{ formatMoney(data.outstandingAmount) }}
               </span>
             </template>
           </Column>
   
           <Column
             header=""
             :exportable="false"
           >
             <template #body="{ data }">
               <EduToolFeesManagerArrearsBreakdown
                 :student="transformData(data)"
               >
               <template #default="{disabled}">
                 <Button
                   icon="pi pi-list"
                   severity="secondary"
                   text
                   type="button"
                   :disabled="disabled"
                 />
               </template>
               </EduToolFeesManagerArrearsBreakdown>
             </template>
           </Column>
   
           <template #footer>
             <div class="flex justify-end">
               <span class="text-sm font-semibold text-surface-700 dark:text-surface-200">
                 {{ arrearsStore.students.length }}
                 {{ arrearsStore.students.length === 1 ? 'student' : 'students' }}
               </span>
             </div>
           </template>
         </DataTable>
       </div>
     </div>
  </div>
</template>

<style scoped></style>