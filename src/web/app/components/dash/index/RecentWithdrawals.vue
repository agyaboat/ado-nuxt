<script setup lang="ts">
  const data = ref();
  onMounted(() => {
    data.value = [
      {
        trx_id: 'TRX-2025-0001',
        date: '2025-01-03',
        status: 'SUCCESS',
        amount: 1250.00,
      },
      {
        trx_id: 'TRX-2025-0002',
        date: '2025-01-05',
        status: 'PENDING',
        amount: 300.50,
      },
      {
        trx_id: 'TRX-2025-0003',
        date: '2025-01-08',
        status: 'FAILED',
        amount: 980.00,
      },
      {
        trx_id: 'TRX-2025-0004',
        date: '2025-01-10',
        status: 'SUCCESS',
        amount: 5200.00,
      }
    ]
  })
  const columns = [
      { field: 'trx_id', header: 'TRANSACTION ID' },
      { field: 'date', header: 'DATE' },
      { field: 'status', header: 'STATUS' },
      { field: 'amount', header: 'AMOUNT' }
  ];

  const {summary, checkSummary} = useWithdrawalSummaryStore()
  onMounted(()=>{
    checkSummary()
  })

  const getStatusLabel = (status: string) => {
      switch (status.toUpperCase()) {
          case 'SUCCESS':
              return 'success';

          case 'PENDING':
              return 'warn';

          case 'FAILED':
              return 'danger';

          default:
              return 'contrast';
      }
  };
</script>

<template>
  <div class="border border-cv-slate rounded-xl overflow-hidden bg-white dark:bg-slate-900">
    <!-- <DataTable :value="data" class="text-sm" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width:50rem"> -->
    <DataTable :value="summary.data.list" class="text-sm" tableStyle="min-width:50rem" :loading="summary.loading">
      <template #header>
        <div class="p-3 md:p-4 flex justify-between items-center">
          <div class="text-lg md:text-xl font-bold">Recent Withdrawals</div>
          <NuxtLink class="text-primary flex items-center">View All <span class="material-symbols-outlined">arrow_forward</span></NuxtLink>
        </div>
      </template>
      <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" :pt="{headerCell: {class: 'bg-slate-100 dark:bg-slate-950 text-muted-color'}}" class="">
        <template #body="slotProps">
          <Tag size="small" v-if="slotProps.field == 'status'" :value="slotProps.data.status" :severity="getStatusLabel(slotProps.data.status)" />
          <div v-else>{{ slotProps.data[slotProps.field as string] }}</div>
        </template>
      </Column>
    </DataTable>
    <div>

    </div>
  </div>
</template>

<style scoped>
</style>
