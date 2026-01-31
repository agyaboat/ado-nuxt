<script setup lang="ts"></script>

<template>
  <CVCard class="rounded-lg shadow! lg:px-6 lg:py-4">
    <div class="flex justify-between">
      <div>
        <div class="bg-cv-emerald text-cv-emerald rounded-lg p-2 flex items-center">
          <span class="material-symbols-outlined">payments</span>
        </div>
      </div>
      <span class="material-symbols-outlined text-7xl! text-primary/10">payments</span>
    </div>
    <div class="font-bold text-xl mb-2">Payout Requests</div>
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-1">
        <div class="text-muted-color font-bold text-sm">Pending Approvals</div>
        <div class="font-bold text-xl">300</div> 
      </div>
      <div class="col-span-1 mb-6">
        <div class="text-muted-color font-bold text-sm">High Value</div>
        <div class="font-bold text-xl text-amber-400">22</div>
      </div>
    </div>
    <div>
      <Button fluid>
        Manage Payouts
      </Button>
    </div>
  </CVCard>
</template>

<style scoped></style>
