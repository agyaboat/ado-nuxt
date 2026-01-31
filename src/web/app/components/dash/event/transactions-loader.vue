<script setup lang="ts">
  const transactionx = [
    { amount: 150 },
    { amount: 150 },
    { amount: 150 },
    { amount: 150 },
    { amount: 150 },
    { amount: 150 },
  ]

  const list = [
    {label: 'Total Revenue', icon: 'paid', color: 'emerald'},
    {label: 'Net Income', icon: 'money_bag', color: 'blue'},
    {label: 'Avg. Transaction', icon: 'analytics', color: 'amber'},
  ]

  const columns = ['Status', 'Amount', 'Contestant', 'Reference', 'Channel', 'Date']

</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <CVCard class="flex items-center rounded-xl" v-for="record in list">
        <div class="flex gap-5">
          <div class="flex items-center">
            <div class="flex items-center p-3 rounded-lg border" :class="`bg-cv-${record.color} border-cv-${record.color}`">
              <span class="material-symbols-outlined" :class="`text-cv-${record.color}`">{{ record.icon }}</span>
            </div>
          </div>
          <div class="grow">
            <div class="text-muted-color mb-1 text-sm font-semibold">{{ record.label }}</div>
            <Skeleton class="font-bold text-2xl p-3 rounded-lg max-w-28" />
          </div>
        </div>
      </CVCard>
    </div>
    <CVCard class="rounded-lg overflow-hidden">
      <DataTable :value="transactionx" table-style="min-width: 50rem">
        <template #header>
        <div class="flex flex-row gap-3 items-center justify-between w-full">
          <div class="flex gap-3 items-center justify-between">
            <IconField class="">
              <InputIcon class="pi pi-search" />
              <InputText class="w-full" placeholder="search by contestant..." disabled />
            </IconField>
            <div class="flex items-center">
              <Button severity="secondary">
                <template #icon>
                  <span class="material-symbols-outlined">filter_list</span>
                </template>
              </Button>
            </div>
          </div>
    
          <div class="text-right">
            <Button label="Export Report" :pt="{label: {class:'hidden md:block'}}" severity="contrast" size="small">
              <template #icon>
                <span class="material-symbols-outlined">download</span>
              </template>
            </Button>
          </div>
        </div>
      </template>

      <Column v-for="col in columns">
        <template #header>
          <span v-if="col==='Status'" class="inline-block size-3 rounded-full bg-slate-950 dark:bg-white"></span>
          <h2 v-else class="font-bold">{{ col }}</h2>
        </template>

        <template #body>
          <Skeleton v-if="col==='Status'" class="max-w-4 rounded-full" />
          <Skeleton v-else class="p-2 max-w-20" />
        </template>
      </Column>

    </DataTable>
    </CVCard>
  </div>
</template>

<style scoped></style>
