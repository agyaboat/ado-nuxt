<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAdoFetch } from '#imports'

interface Payment {
  id: string
  student: {
    id: string
    name: string
    admissionNumber: string | null
  }
  amount: number
  mode: string
  paymentMethod: string | null
  paidAt: string
  reference: string | null
}

interface Allocation {
  id: string
  type: 'old_arrears' | 'academic_fee'
  amount: number
  academicPeriod: {
    id: string
    label: string
    academicYear: {
      id: string
      label: string
    }
  } | null
}

const props = defineProps<{
  payment: Payment
}>()

const visible = defineModel<boolean>({ default: false })

const route = useRoute()
const api = useAdoFetch()

const accessId = computed(() => route.params.access_id as string)

const allocations = ref<Allocation[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchAllocations = async () => {
  allocations.value = []
  error.value = null
  loading.value = true

  try {
    const response = await api.get(
      `/edutools/fees_manager/${accessId.value}/payments/${props.payment.id}/allocations`,
    )

    const result = await response.json()

    if (!response.ok) {
      error.value = result.message ?? 'Failed to load payment allocations.'
      return
    }

    allocations.value = result.data ?? []
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load payment allocations.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.payment.id,
  () => {
    fetchAllocations()
  },
  { immediate: true },
)

const totalAllocated = computed(() =>
  allocations.value.reduce(
    (total, allocation) => total + allocation.amount,
    0,
  ),
)

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount / 100)
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Payment Allocation"
    :style="{ width: '42rem' }"
  >
    <div class="space-y-4">
      <div>
        <div class="font-semibold">
          {{ payment.student.name }}
        </div>

        <div class="text-sm text-surface-500">
          {{ payment.student.admissionNumber }}
        </div>
      </div>

      <Message
        v-if="error"
        severity="error"
        variant="outlined"
      >
        {{ error }}
      </Message>

      <div
        v-else-if="loading"
        class="py-8 text-center text-surface-500"
      >
        Loading allocation...
      </div>

      <div v-else class="mb-4">
        <DataTable
          :value="allocations"
          size="small"
          class="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800"
        >
          <Column header="Academic Year">
            <template #body="{ data }">
              <template v-if="data.type === 'old_arrears'">
                Previous Arrears
              </template>

              <template v-else>
                {{ data.academicPeriod.academicYear.label }}
              </template>
            </template>
          </Column>

          <Column header="Academic Period">
            <template #body="{ data }">
              <template v-if="data.type === 'old_arrears'">
                —
              </template>

              <template v-else>
                {{ data.academicPeriod.label }}
              </template>
            </template>
          </Column>

          <Column header="Allocated">
            <template #body="{ data }">
              {{ formatMoney(data.amount) }}
            </template>
          </Column>

          <template #footer>
            <div class="flex items-center justify-between">
              <span class="font-bold">
                Total Allocated
              </span>

              <span class="font-black">
                {{ formatMoney(totalAllocated) }}
              </span>
            </div>
          </template>
        </DataTable>
      </div>

      <EduToolFeesManagerGenerateReceipt
        :payment="props.payment"
        :allocations="allocations"
      />
    </div>
  </Dialog>
</template>