<script setup lang="ts">
const props = defineProps<{
  search: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
}>()

const searchValue = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})
</script>

<template>
  <section
    class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
  >
    <div>
      <h1
        class="text-3xl font-black tracking-tight text-surface-900 dark:text-surface-0"
      >
        Tools Explorer
      </h1>

      <p
        class="mt-2 max-w-2xl text-sm leading-6 text-surface-500 dark:text-surface-400"
      >
        Discover tools to build your ScholarSaaS workspace.
      </p>
    </div>

    <IconField class="w-full lg:w-80">
      <InputIcon class="pi pi-search" />

      <InputText
        v-model="searchValue"
        placeholder="Search tools..."
        class="w-full"
      />
    </IconField>
  </section>
</template>