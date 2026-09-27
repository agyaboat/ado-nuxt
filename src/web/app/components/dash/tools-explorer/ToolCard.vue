<script setup lang="ts">
import type { MarketTool } from '~/stores/dash.tools_explorer'

const props = defineProps<{
  tool: MarketTool
}>()

const emit = defineEmits<{
  learn: [tool: MarketTool]
}>()

const categoryLabel = computed(() => {
  if (!props.tool.category) return 'General'

  return props.tool.category
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
})

const icon = computed(() => {
  return props.tool.meta?.icon || resolveIcon(props.tool.category)
})

const tone = computed(() => {
  return props.tool.meta?.tone || resolveTone(props.tool.category)
})

function resolveTone(category: string | null) {
  if (category === 'finance') return 'orange'
  if (category === 'academic') return 'emerald'
  if (category === 'management') return 'blue'

  return 'slate'
}

function resolveIcon(category: string | null) {
  if (category === 'finance') return 'pi pi-wallet'
  if (category === 'academic') return 'pi pi-book'
  if (category === 'management') return 'pi pi-briefcase'

  return 'pi pi-box'
}
</script>

<template>
  <article
    class="group flex h-full min-h-72 flex-col rounded-2xl border border-surface-200 bg-surface-0 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-surface-300 hover:shadow-lg dark:border-surface-700 dark:bg-surface-900 dark:hover:border-surface-600"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div
        v-if="!tool.image"
        class="flex h-14 w-14 items-center justify-center rounded-2xl"
        :class="{
          'bg-orange-50 text-orange-600 dark:bg-orange-400/10 dark:text-orange-300':
            tone === 'orange',

          'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300':
            tone === 'emerald',

          'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300':
            tone === 'blue',

          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300':
            tone === 'slate',
        }"
      >
        <i :class="[icon, 'text-xl']" />
      </div>

      <img
        v-else
        :src="tool.image"
        :alt="tool.label"
        class="h-14 w-14 rounded-2xl object-cover"
      >

      <span
        class="rounded-full bg-surface-100 px-3 py-1.5 text-xs font-medium text-surface-600 dark:bg-surface-800 dark:text-surface-300"
      >
        {{ categoryLabel }}
      </span>
    </div>

    <!-- Content -->
    <div class="mt-7">
      <h3
        class="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-0"
      >
        {{ tool.label }}
      </h3>

      <p
        v-if="tool.sublabel"
        class="mt-1 text-sm font-medium text-surface-500 dark:text-surface-400"
      >
        {{ tool.sublabel }}
      </p>

      <p
        class="mt-3 text-sm leading-6 text-surface-600 dark:text-surface-300"
      >
        {{ tool.description || 'A ScholarSaaS tool for your workspace.' }}
      </p>
    </div>

    <!-- Actions -->
    <div class="mt-auto flex items-center justify-between gap-4 pt-8">
      <button
        type="button"
        class="group/learn inline-flex items-center gap-2 text-sm font-medium text-emerald-500 transition-colors hover:text-emerald-400"
        @click="emit('learn', tool)"
      >
        Learn more

        <i
          class="pi pi-arrow-right text-sm transition-transform duration-200 group-hover/learn:translate-x-1"
        />
      </button>

      <DashToolsExplorerSubscribe :tool />
    </div>
  </article>
</template>