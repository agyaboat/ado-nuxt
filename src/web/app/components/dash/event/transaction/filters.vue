<script setup lang="ts">
import { DateTime } from 'luxon'
const {transactions, fetchTransactions} = useEventTransactionsStore()
const visible = ref(false)
const toast = useToast()

const today = DateTime.now().toISODate()

const form = reactive({
  status: null as 'success' | 'failed' | 'initiated' | 'all' | null,
  channel: null as 'web' | 'ussd' | 'all' | null,
  
  startDate: null as string | null,
  endDate: null as string | null,
  
  category: null as string | null,
  contestant: '' as string,
})

watch(()=>visible.value, (v)=>{
  if(v){
    Object.assign(form, {...transactions.data.meta})
  }
})

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Successful', value: 'success' },
  { label: 'Failed', value: 'failed' },
  { label: 'Initiated', value: 'initiated' },
]

const channelOptions = [
  { label: 'All', value: 'all' },
  { label: 'Web', value: 'web' },
  { label: 'USSD', value: 'ussd' },
]

const categoryOptions = [
  { label: 'Voting', value: 'voting' },
  { label: 'Donation', value: 'donation' },
  { label: 'Refund', value: 'refund' },
]

const reset = () => {
  Object.assign(form, {
    status: 'success',
    channel: 'all',
    startDate: null,
    endDate: null,
    category: null,
    contestant: null,
  })
}

const applyFilters = () => {
  Object.assign(transactions.data.meta, {...form})
  fetchTransactions()
  
  visible.value = false

  // emit / router.push / fetch
  // console.log('filters:', payload)

  toast.add({
    severity: 'success',
    summary: 'Filters applied',
    life: 2000,
  })
}
</script>

<template>
  <div>
    <Button severity="secondary" @click="visible = true">
      <template #icon>
        <span class="material-symbols-outlined">filter_list</span>
      </template>
    </Button>

    <Dialog
      v-model:visible="visible"
      header="Transaction Filters"
      modal
      :style="{ width: '30rem' }"
      :breakpoints="{ '460px': '92vw' }"
    >
      <div class="py-4 space-y-6">

        <!-- Status -->
        <FloatLabel variant="on">
          <Select
            fluid
            id="status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            v-model="form.status"
          />
          <label for="status">Status</label>
        </FloatLabel>

        <!-- Channel -->
        <FloatLabel variant="on">
          <Select
            fluid
            id="channel"
            :options="channelOptions"
            optionLabel="label"
            optionValue="value"
            v-model="form.channel"
          />
          <label for="channel">Channel</label>
        </FloatLabel>

        <!-- Category -->
        <FloatLabel variant="on" v-if="false">
          <Select
            fluid
            id="category"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            v-model="form.category"
          />
          <label for="category">Category</label>
        </FloatLabel>

        <!-- Date Range -->
         <div class="p-1 py-3 border rounded-lg border-dashed">
          <div class="font-bold mb-3">Date range</div>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col">
              <label>Begin</label>
              <InputText
                type="date"
                :max="today"
                v-model="form.startDate"
              />
            </div>
            <div class="flex flex-col">
              <label>End</label>
              <InputText
                type="date"
                :max="today"
                v-model="form.endDate"
              />
            </div>
  
          </div>
         </div>

        <!-- Contestant Code -->
        <FloatLabel variant="on">
          <InputText
            id="contestant"
            placeholder="e.g. CNT-042"
            v-model="form.contestant"
          />
          <label for="contestant">Contestant code</label>
        </FloatLabel>

        <!-- Actions -->
        <div class="flex justify-between pt-2">
          <Button
            label="Reset"
            severity="secondary"
            outlined
            @click="reset"
          />

          <Button label="Apply" @click="applyFilters">
            <template #icon>
              <span class="material-symbols-outlined">wand_stars</span>
            </template>
          </Button>
        </div>

      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
