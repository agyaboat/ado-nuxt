<script setup lang="ts">
import { computed, ref } from 'vue'

interface Student {
  label: string
  sublabel: string
  value: string
  outstandingAmount: number
}

interface ArrearsPeriod {
  id: string
  label: string
  total: number
  paid: number
  balance: number
}

interface AcademicYearArrears {
  id: string
  label: string
  periods: ArrearsPeriod[]
  totalDebt: number
}

interface OldArrears {
  id: string
  total: number
  paid: number
}

interface StudentArrears {
  old: OldArrears | null
  years: AcademicYearArrears[]
  grandTotal: number
}

const props = defineProps<{
  student: Student
}>()

const route = useRoute()
const api = useAdoFetch()

const visible = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const arrears = ref<StudentArrears | null>(null)

const accessId = computed(() => String(route.params.access_id))

const oldBalance = computed(() => {
  if (!arrears.value?.old) {
    return 0
  }

  return Math.max(
    arrears.value.old.total - arrears.value.old.paid,
    0,
  )
})

const hasArrearsRecords = computed(() => {
  return Boolean(
    arrears.value &&
      (arrears.value.years.length > 0 || arrears.value.old),
  )
})

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
}

async function fetchArrears() {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(
      `/edutools/fees_manager/${accessId.value}/students/${props.student.value}/arrears`,
    )

    const result = await response.json()

    if (!response.ok) {
      error.value = result.message ?? 'Unable to load arrears breakdown.'
      arrears.value = null
      return
    }

    arrears.value = result.data ?? {
      old: null,
      years: [],
      grandTotal: 0,
    }
  } catch {
    error.value = 'Unable to load arrears breakdown.'
    arrears.value = null
  } finally {
    loading.value = false
  }
}

async function open() {
  visible.value = true
  await fetchArrears()
}

function close() {
  visible.value = false
}

defineExpose({
  open,
})
</script>

<template>
  <span @click="open">
    <slot :disabled="student.outstandingAmount === 0">
      <Button
        label="View breakdown"
        icon="pi pi-list"
        severity="secondary"
        text
        type="button"
        :disabled="student.outstandingAmount === 0"
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    header="Arrears Breakdown"
    :style="{ width: '44rem' }"
  >
    <div class="space-y-6">
      <!-- Student -->
      <div>
        <p class="text-lg font-bold text-surface-900 dark:text-surface-0">
          {{ student.label }}
        </p>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-12"
      >
        <ProgressSpinner
          style="width: 2rem; height: 2rem"
          stroke-width="4"
        />
      </div>

      <!-- Error -->
      <Message
        v-else-if="error"
        severity="error"
        :closable="false"
      >
        {{ error }}
      </Message>

      <template v-else-if="arrears">
        <!-- No records -->
        <Message
          v-if="!hasArrearsRecords"
          severity="info"
          :closable="false"
        >
          This student has no fee records yet.
        </Message>

        <template v-else>
          <!-- Academic Year Arrears -->
          <div
            v-for="year in arrears.years"
            :key="year.id"
            class="space-y-3"
          >
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-surface-900 dark:text-surface-0">
                {{ year.label }}
              </h3>

              <span
                class="font-semibold text-surface-600 dark:text-surface-300"
              >
                {{ formatMoney(year.totalDebt) }}
              </span>
            </div>

            <DataTable
              :value="year.periods"
              size="small"
              class="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800"
            >
              <Column
                field="label"
                header="Period"
              />

              <Column
                field="total"
                header="Total"
              >
                <template #body="{ data }">
                  {{ formatMoney(data.total) }}
                </template>
              </Column>

              <Column
                field="paid"
                header="Paid"
              >
                <template #body="{ data }">
                  {{ formatMoney(data.paid) }}
                </template>
              </Column>

              <Column
                field="balance"
                header="Balance"
              >
                <template #body="{ data }">
                  <span class="font-semibold">
                    {{ formatMoney(data.balance) }}
                  </span>
                </template>
              </Column>

              <template #footer>
                <div class="flex items-center justify-between">
                  <span class="font-bold">
                    Total Debt
                  </span>

                  <span class="font-black">
                    {{ formatMoney(year.totalDebt) }}
                  </span>
                </div>
              </template>
            </DataTable>
          </div>

          <!-- Previous Arrears -->
          <div
            v-if="arrears.old"
            class="space-y-3"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-surface-900 dark:text-surface-0">
                  Previous Arrears
                </h3>

                <p class="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  Balance carried over from before using ScholarSaaS
                </p>
              </div>

              <span
                class="font-semibold text-surface-600 dark:text-surface-300"
              >
                {{ formatMoney(oldBalance) }}
              </span>
            </div>

            <DataTable
              :value="[arrears.old]"
              size="small"
              class="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800"
            >

              <Column
                header="Total"
              >
                <template #body>
                  {{ formatMoney(arrears.old!.total) }}
                </template>
              </Column>

              <Column
                header="Paid"
              >
                <template #body>
                  {{ formatMoney(arrears.old!.paid) }}
                </template>
              </Column>

              <Column
                header="Balance"
              >
                <template #body>
                  <span class="font-semibold">
                    {{ formatMoney(oldBalance) }}
                  </span>
                </template>
              </Column>

              <template #footer>
                <div class="flex items-center justify-between">
                  <span class="font-bold">
                    Total Debt
                  </span>

                  <span class="font-black">
                    {{ formatMoney(oldBalance) }}
                  </span>
                </div>
              </template>
            </DataTable>
          </div>

          <!-- Grand Total -->
          <div
            class="flex items-center justify-between rounded-xl bg-surface-900 px-5 py-4 text-white dark:bg-surface-800"
          >
            <span class="font-bold">
              Grand Total
            </span>

            <span class="text-xl font-black">
              {{ formatMoney(arrears.grandTotal) }}
            </span>
          </div>

          <EduToolFeesManagerArrearsBreakdownPdf
            :student="student"
            :arrears="arrears"
          />
        </template>
      </template>
    </div>
  </Dialog>
</template>