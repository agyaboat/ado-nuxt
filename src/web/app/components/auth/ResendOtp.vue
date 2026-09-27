<script setup lang="ts">
const props = defineProps<{
  phone: string
}>()

const emit = defineEmits<{
  resent: []
}>()

const loading = ref(false)
const countdown = ref(60)

let timer: ReturnType<typeof setInterval> | undefined

const startCountdown = () => {
  countdown.value = 60

  clearInterval(timer)

  timer = setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const resend = async () => {
  if (loading.value || countdown.value > 0) return

  loading.value = true

  try {
    const response = await useAdoFetch().post('/auth/v2/resend-otp')

    if (!response.ok) {
      const data = await response.json()

      throw new Error(data.message || 'Unable to resend code.')
    }

    startCountdown()
    emit('resent')
  } catch (error) {
    console.error('Resend OTP error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(startCountdown)

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="text-center text-sm text-surface-500">
    <template v-if="countdown > 0">
      Didn't receive the code?
      <span class="font-medium">
        Resend in {{ countdown }}s
      </span>
    </template>

    <template v-else>
      Didn't receive the code?

      <Button
        label="Resend code"
        variant="link"
        size="small"
        class="p-0 font-semibold"
        :loading="loading"
        @click="resend"
      />
    </template>
  </div>
</template>