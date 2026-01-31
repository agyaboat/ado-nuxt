<script setup lang="ts">
  const data = {
    balance: 10.00,
    growth: {
      basis: 'month',
      rate: 1.6
    }
  }

  const el = useTemplateRef('el')
  const { isFullscreen, enter, exit, toggle } = useFullscreen(el)

  const { summary, checkWallet } = useWalletSummaryStore()
  
  onMounted(() => {
    checkWallet()
  })

  const growthRate = computed(()=>{
    if(summary.lastMonthBalance === 0) return 0
    if(summary.balance === null || summary.lastMonthBalance === null) return 0
    return ((summary.balance - summary.lastMonthBalance) / summary.lastMonthBalance * 100)
  })
</script>

<template>
  <!-- <div class="cv-card flex items-center justify-center" v-if="fetchWalletError"></div> -->
  <DashIndexWalletBalanceSkeleton v-if="summary.loading" />
  <div v-else class="cv-card col-span-1 md:col-span-2 lg:col-span-5 flex items-center" ref="el">
    <div class="flex flex-col gap-6 w-full">
      <div class="flex">
        <div class="grow flex flex-col select-none">
          <h2 class="text-muted-color">WALLET BALANCE</h2>
          <div v-if="!summary.fetchError" class="font-bold text-4xl tracking-tight text-cv-zinc"><Cedi class="mr-1" />{{ summary.balance?.toFixed(2) }}</div>
          <div v-else class="text-cv-red font-semibold">{{ summary.fetchError }}</div>
        </div>
        <div class="">
          <div class="flex items-center p-2 rounded-full bg-cv-slate border border-cv-slate drop-shadow-2xl drop-shadow-emerald-200">
            <span class="material-symbols-outlined text-cv-emerald">account_balance_wallet</span>
          </div>
        </div>
      </div>

      <div class="flex gap-5">
        <div class="flex flex-col justify-end grow">
          <div class="flex gap-3">
            <span class="rounded flex items-center gap-0.5 text-xs font-semibold px-1" :class="growthRate < 0?['bg-cv-red', 'text-cv-red']:['bg-cv-emerald', 'text-cv-emerald']">
              <span class="material-symbols-outlined text-sm!">{{ growthRate < 0 ? 'trending_down':'trending_up' }}</span>
              <span>{{ growthRate }}%</span>
            </span>
            <div class="text-muted-color">vs last month</div>
          </div>
        </div>
        <div>
          <Button label="Cashout" variant="outlined" class="bg-cv-gray" severity="contrast" :disabled="summary.balance === null || summary.balance < 5" @click="toggle">
            <template #icon>
              <span class="material-symbols-outlined">move_item</span>
            </template>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
