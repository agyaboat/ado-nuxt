<script setup lang="ts">
defineProps<{
  total: number
  active: number
  marketVisible: number
  deprecated: number
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
      <template #content>
        <p class="text-muted-color text-sm font-semibold">
          Total Tools
        </p>
        <p class="text-3xl font-black mt-2">
          {{ total }}
        </p>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="text-muted-color text-sm font-semibold">
          Active Tools
        </p>
        <p class="text-3xl font-black mt-2">
          {{ active }}
        </p>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="text-muted-color text-sm font-semibold">
          Market Visible
        </p>
        <p class="text-3xl font-black mt-2">
          {{ marketVisible }}
        </p>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="text-muted-color text-sm font-semibold">
          Deprecated
        </p>
        <p class="text-3xl font-black mt-2">
          {{ deprecated }}
        </p>
      </template>
    </Card>
  </div>
</template>