<script setup lang="ts">
const toast = useToast()

const notify = () => {
  toast.add({
    severity: 'info',
    summary: 'Coming soon',
    detail: 'Email account linking will be available soon.',
    life: 5000,
  })
}
</script>

<template>
  <CVCard>
    <div class="flex items-center justify-between gap-4">
      <div>
        <div class="text-lg font-semibold">
          Email account
        </div>

        <div class="mt-1 text-sm text-surface-500">
          Link your Google account for another way to access ScholarSaaS.
        </div>
      </div>

      <Button
        label="Coming soon"
        size="small"
        variant="outlined"
        disabled
        @click="notify"
      />
    </div>
  </CVCard>
</template>