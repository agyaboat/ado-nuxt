<script setup lang="ts">
const props = defineProps<{
  categories: string[]
  selectedCategory: string
}>()

const emit = defineEmits<{
  'update:selectedCategory': [value: string]
}>()

function selectCategory(category: string) {
  emit('update:selectedCategory', category)
}
</script>

<template>
  <section class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 class="text-lg font-bold text-slate-950 dark:text-white">
        Available tools
      </h2>

      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Each subscription creates a separate workspace.
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button
        v-for="category in props.categories"
        :key="category"
        :label="category"
        :severity="props.selectedCategory === category ? 'contrast' : 'secondary'"
        :outlined="props.selectedCategory !== category"
        size="small"
        @click="selectCategory(category)"
      />
    </div>
  </section>
</template>