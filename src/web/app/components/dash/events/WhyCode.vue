<script setup lang="ts">
  const visible = ref(false)
</script>

<template>
  <span @click="visible = !visible">
    <slot>
      <Button variant="text" label="Why this?" size="small" />
    </slot>
  </span>
  <Dialog v-model:visible="visible" header="Why Event Code" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
    <div class="p-2 border border-cv-zinc border-dashed">
      <p class="mb-2">
        Your Event Code performs two functions:
      </p>
      <ul class="list-decimal p-3">
        <li class="mb-4">
          Identifies your event publicly. 
          You can visit 
          <span class="text-primary block">https://crownvote.com/events/<span class="text-amber-400"><span class="hidden md:inline">event_</span>code</span></span>
          to view your event once it is public. You can, thus, share it to others to view it too.
        </li>
        <li class="mb-4">
          <span class="block mb-1">
            It is also used in generating contestant codes in the order of which they are added.
          </span class=block>
          <span>
            If your event code is <span class="text-primary">ABC</span>, 
            then your <span class="font-bold">first contestant</span> to be added gets the code <span class="text-primary">ABC1</span>
          </span>
        </li>
        <li class="text-muted-color">
          <span>Subtly, event categories are affected too. </span>
          <span>Your first category gets the code <span class="text-primary">ABC-1</span></span>
          if your event code is <span class="text-primary">ABC</span>
        </li>
      </ul>
    </div>
  </Dialog>
</template>

<style scoped></style>
