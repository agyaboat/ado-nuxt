<script setup lang="ts">
import type { MarketTool } from '~/stores/dash.tools_explorer'

const props = defineProps<{
  tool: MarketTool
  subscribing?: boolean
}>()

const emit = defineEmits<{
  learn: [tool: MarketTool]
  subscribe: [tool: MarketTool]
}>()

const categoryLabel = computed(() => {
  if (!props.tool.category) return 'General'

  return props.tool.category
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
})

const tone = computed(() => {
  return props.tool.meta?.tone || props.tool.image?.tone || resolveTone(props.tool.category)
})

const icon = computed(() => {
  return props.tool.image?.icon || props.tool.meta?.icon || resolveIcon(props.tool.category)
})

const tagSeverity = computed(() => {
  if (props.tool.category === 'finance') return 'warning'
  if (props.tool.category === 'academic') return 'success'
  if (props.tool.category === 'management') return 'info'
  return 'secondary'
})

const actionSeverity = computed(() => {
  return props.tool.meta?.actionSeverity || tagSeverity.value
})

const metaBadge = computed(() => {
  return props.tool.meta?.badge || props.tool.type
})

function resolveTone(category: string | null) {
  if (category === 'finance') return 'orange'
  if (category === 'academic') return 'emerald'
  if (category === 'management') return 'slate'
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
  <Card class="overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <template #content>
      <div class="flex min-h-64 flex-col">
        <div class="flex items-start justify-between gap-4">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            :class="{
              'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300': tone === 'emerald',
              'bg-orange-50 text-orange-600 dark:bg-orange-400/10 dark:text-orange-300': tone === 'orange',
              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300': tone === 'slate',
              'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300': tone === 'blue',
              'bg-purple-50 text-purple-600 dark:bg-purple-400/10 dark:text-purple-300': tone === 'purple',
            }"
          >
            <i :class="icon" />
          </div>

          <Tag
            :value="categoryLabel"
            :severity="tagSeverity"
          />
        </div>

        <h3 class="mt-6 text-xl font-black tracking-tight text-slate-950 dark:text-white">
          {{ tool.label }}
        </h3>

        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {{ tool.description || 'No description provided yet.' }}
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <Tag
            :value="metaBadge"
            severity="secondary"
          />
        </div>

        <div class="mt-auto pt-6">
          <Divider />

          <div class="flex items-center justify-between gap-3">
            <Button
              label="Learn more"
              icon="pi pi-arrow-right"
              icon-pos="right"
              text
              size="small"
              @click="emit('learn', tool)"
            />

            <Button
              label="Subscribe"
              icon="pi pi-plus"
              icon-pos="right"
              :severity="actionSeverity"
              :loading="subscribing"
              size="small"
              @click="emit('subscribe', tool)"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>