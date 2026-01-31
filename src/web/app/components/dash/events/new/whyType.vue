<script setup lang="ts">
  const visible = ref(false)
</script>

<template>
  <span @click="visible = !visible">
    <slot>
      <Button variant="text" label="Why type?" size="small" />
    </slot>
  </span>
  <Dialog v-model:visible="visible" header="Why Event Type" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
    <div class="p-2 border border-cv-zinc border-dashed">
      <p class="mb-2">
        All events, regardless of type, have the same features and follow the same workflow.
        The type only affect the bagde shown on the event card in your dashboard and the public event page.
      </p>
      <ul class="list-decimal p-3 mb-2">
        <li class="mb-4">
          <span class="font-bold text-primary">Pageantry Type: </span> This has the crown badge <span class="material-symbols-outlined text-primary align-middle">chess_queen</span> and is suitable for events like beauty pageants, talent shows, etc.
        </li>
        <li class="mb-4">
          <span class="font-bold text-amber-400">Award Type: </span> This has the trophy badge <span class="material-symbols-outlined text-amber-400 align-middle">trophy</span> and is suitable for events like awards ceremonies, competitions, etc.
        </li>
      </ul>
      <p>
        In all, the choice of type is mostly for visual distinction and does not impact the functionality of your event.
      </p>
    </div>
  </Dialog>
</template>

<style scoped></style>
