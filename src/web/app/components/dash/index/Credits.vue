<script setup lang="ts">
  const userStore = useUserStore()
  const {summary} = useWalletSummaryStore()
</script>

<template>
  <div class="cv-card p-2 col-span-1 lg:col-span-3 flex items-center">
      <div class="flex flex-col gap-7 w-full">
        <div class="flex">
          <div class="grow flex flex-col">
            <h2 class="text-muted-color">CREDITS</h2>
            <div class="font-bold text-2xl tracking-tight">{{summary.creditBalance}}</div>
          </div>
          <div class="">
            <div class="flex items-center p-2 rounded-full bg-cv-amber border border-cv-amber drop-shadow-2xl drop-shadow-amber-200">
              <span class="material-symbols-outlined text-cv-amber">diamond</span>
            </div>
          </div>
        </div>

        <div class="">
          <Button fluid label="Buy Credit" severity="contrast" variant="text" class="border-cv-zinc bg-slate-200 dark:bg-slate-950" />
        </div>
      </div>
  </div>
</template>

<style scoped></style>
