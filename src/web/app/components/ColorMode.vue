<template>
  <Button
    @click="() => setColorMode(!isDark)"
    variant="text"
    rounded
    :icon="isDark ? 'pi pi-moon' : 'pi pi-sun'"
    size="small"
    severity="contrast"
  />
</template>

<script setup>
import { useColorMode } from '~/composables/useColorMode'

const { isDark, setColorMode } = useColorMode()
</script>