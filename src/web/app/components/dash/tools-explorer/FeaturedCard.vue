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

const includedTools = computed(() => {
  return props.tool.meta?.includedTools || []
})
</script>

<template>
  <Card class="mt-6 overflow-hidden">
    <template #content>
      <section class="relative overflow-hidden rounded-3xl bg-emerald-600 p-6 text-white sm:p-8">
        <div class="absolute inset-y-0 right-0 hidden w-80 bg-emerald-700/25 lg:block" />

        <div class="absolute -bottom-16 right-8 hidden h-56 w-56 opacity-20 lg:block">
          <div class="absolute left-16 top-14 h-20 w-20 rounded-full border-18 border-white" />
          <div class="absolute left-2 top-20 h-12 w-12 rounded-full border-14 border-white" />
          <div class="absolute bottom-4 left-10 h-12 w-12 rounded-full border-14 border-white" />
          <div class="absolute right-0 top-2 h-12 w-12 rounded-full border-14 border-white" />
          <div class="absolute left-20 top-28 h-20 w-28 rotate-[-28deg] border-t-16 border-white" />
          <div class="absolute left-20 top-20 h-28 w-28 rotate-32 border-r-16 border-white" />
        </div>

        <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Tag
              value="Featured"
              severity="success"
            />

            <h2 class="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              {{ tool.label }}
            </h2>

            <p class="mt-3 max-w-xl text-sm leading-7 text-emerald-50">
              {{ tool.description || 'A featured ScholarSaaS workspace tool.' }}
            </p>

            <div
              v-if="includedTools.length"
              class="mt-5 flex flex-wrap gap-2"
            >
              <Tag
                v-for="item in includedTools"
                :key="item"
                :value="item"
                severity="secondary"
              />
            </div>

            <div
              v-else
              class="mt-5 flex flex-wrap gap-2"
            >
              <Tag
                :value="tool.type"
                severity="secondary"
              />

              <Tag
                v-if="tool.category"
                :value="tool.category"
                severity="secondary"
              />
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <Button
              label="Learn more"
              icon="pi pi-arrow-right"
              icon-pos="right"
              severity="secondary"
              outlined
              size="large"
              @click="emit('learn', tool)"
            />

            <Button
              v-if="tool.isSubscribed"
              label="Subscribed"
              icon="pi pi-check"
              icon-pos="right"
              severity="secondary"
              size="large"
              disabled
            />

            <Button
              v-else
              label="Subscribe"
              icon="pi pi-plus"
              icon-pos="right"
              severity="secondary"
              size="large"
              :loading="subscribing"
              @click="emit('subscribe', tool)"
            />
          </div>
        </div>
      </section>
    </template>
  </Card>
</template>