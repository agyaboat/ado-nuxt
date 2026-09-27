<script setup lang="ts">
const props = defineProps<{
  search: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
}>()

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})
</script>

<template>
  <section
    class="mb-6 flex justify-end rounded-2xl border border-surface-200 bg-surface-0 p-3 dark:border-surface-700 dark:bg-surface-900"
  >
    <IconField class="w-full sm:w-80">
      <InputIcon class="pi pi-search" />

      <InputText
        v-model="searchModel"
        placeholder="Search tools..."
        class="w-full"
      />
    </IconField>
  </section>
</template>