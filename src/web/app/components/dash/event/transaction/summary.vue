<script setup lang="ts">
  const props = defineProps<{summary: EventTransactionSummary, event: EventUnit}>()
</script>

<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <CVCard class="flex items-center rounded-xl">
        <div class="flex gap-5">
          <div class="flex items-center">
            <div class="flex items-center p-3 rounded-lg border border-cv-emerald bg-cv-emerald">
              <span class="material-symbols-outlined text-cv-emerald">paid</span>
            </div>
          </div>
          <div class="grow">
            <div class="text-muted-color mb-1 text-sm font-semibold">Total Revenue</div>
            <div class="font-bold text-2xl" ><Cedi /> {{ summary.totalRevenue.toLocaleString('en-GH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) }} </div>
          </div>
        </div>
      </CVCard>
      
      <CVCard class="flex items-center rounded-xl">
        <div class="flex gap-5">
          <div class="flex items-center">
            <div class="flex items-center p-3 rounded-lg border border-cv-blue bg-cv-blue">
              <span class="material-symbols-outlined text-cv-blue">percent</span>
            </div>
          </div>
          <div class="grow">
            <div class="text-muted-color mb-1 text-sm font-semibold">Service Charge</div>
            <div class="font-bold text-xl mb-1" ><Cedi /> 
            {{ 
              summary.serviceCharge.toLocaleString('en-GH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) 
            }}
            </div>
            <div class="text-xs text-primary text-right font-semibold">Charge Rate: <span class="text-amber-400 text-sm">{{ event?.chargeRate }}%</span></div>
          </div>
        </div>
      </CVCard>
  
      <CVCard class="flex items-center rounded-xl" v-if="summary.flatFee">
        <div class="flex gap-5">
          <div class="flex items-center">
            <div class="flex items-center p-3 rounded-lg border border-cv-rose bg-cv-rose">
              <span class="material-symbols-outlined text-cv-rose">attach_money</span>
            </div>
          </div>
          <div class="grow">
            <div class="text-muted-color mb-1 text-sm font-semibold">Flat Platform Fee</div>
            <div class="font-bold text-xl" ><Cedi /> {{ 
              summary.flatFee.toLocaleString('en-GH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}</div>
            <div class="text-xs text-right font-semibold text-muted-color">
              <span>Up to: </span>
              <span class=" text-primary">{{ summary.billEnd }}</span>
            </div>
          </div>
        </div>
      </CVCard>
  
    </div>
    
    <Divider />
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <CVCard class="flex items-center rounded-xl">
        <div class="flex gap-5">
          <div class="flex items-center">
            <div class="flex items-center p-3 rounded-lg border border-cv-emerald bg-cv-emerald">
              <span class="material-symbols-outlined text-cv-emerald">money_bag</span>
            </div>
          </div>
          <div class="grow">
            <div class="text-muted-color mb-1 text-sm font-semibold">Net Income</div>
            <div class="font-bold text-2xl mb-1" ><Cedi /> {{ summary.netIncome.toLocaleString('en-GH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) }} 
            </div>
          </div>
        </div>
      </CVCard>
  
      <CVCard class="flex items-center rounded-xl">
        <div class="flex gap-5">
          <div class="flex items-center">
            <div class="flex items-center p-3 rounded-lg border border-cv-amber bg-cv-amber">
              <span class="material-symbols-outlined text-cv-amber">arrow_upward</span>
            </div>
          </div>
          <div class="grow">
            <div class="text-muted-color mb-1 text-sm font-semibold">Total Withdrawals</div>
            <div class="font-bold text-2xl" ><Cedi /> 0.00</div>
            <div class="text-xs text-primary text-right font-semibold mt-1">
              <Button variant="link" label="View History" size="small" />
            </div>
          </div>
        </div>
      </CVCard>
  
      <CVCard class="flex items-center rounded-xl">
        <div class="flex gap-5">
          <div class="flex items-center">
            <div class="flex items-center p-3 rounded-lg border border-cv-lime bg-cv-lime">
              <span class="material-symbols-outlined text-cv-amber">account_balance_wallet</span>
            </div>
          </div>
          <div class="grow">
            <div class="text-muted-color mb-1 text-sm font-semibold">Available Balance</div>
            <div class="font-bold text-2xl" ><Cedi /> {{ summary.balance.toLocaleString('en-GH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) }}</div>
            <div class="text-xs text-primary text-right font-semibold mt-2">
              <Button variant="link" label="Withdraw Funds" size="small" />
            </div>
          </div>
        </div>
      </CVCard>
  
    </div>
  </div>
</template>

<style scoped></style>
