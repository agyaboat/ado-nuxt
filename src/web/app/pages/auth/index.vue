<script setup lang="ts">
definePageMeta({
  name: 'auth-index',
})

const toast = useToast()

const form = reactive({
  phone: '',
})

const otp = ref('')
const loading = ref(false)
const verifying = ref(false)
const verifyDialogOpen = ref(false)

const ghanaPrefixes = [
  '20',
  '24',
  '25',
  '26',
  '27',
  '28',
  '50',
  '53',
  '54',
  '55',
  '56',
  '57',
  '59',
]

const isValidGhanaPhone = computed(() => {
  const phone = form.phone

  if (!/^\d{9}$/.test(phone)) {
    return false
  }

  return ghanaPrefixes.some((prefix) => phone.startsWith(prefix))
})

const login = async () => {
  if (!isValidGhanaPhone.value) {
    toast.add({
      severity: 'error',
      summary: 'Invalid phone number',
      detail: 'Enter a valid Ghanaian phone number.',
      life: 5000,
    })

    return
  }

  loading.value = true

  try {
    const response = await useAdoFetch().post('/auth/signin', {
      body: JSON.stringify({
        phone: `233${form.phone}`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to continue',
        detail: data.message || 'Please try again.',
        life: 10000,
      })

      return
    }

    if (data.otpSent) {
      verifyDialogOpen.value = true
    }
  } catch (error) {
    console.error('Sign in error:', error)

    toast.add({
      severity: 'error',
      summary: 'Something went wrong',
      detail: 'Please try again.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const verifyOtp = async () => {
  verifying.value = true

  try {
    const response = await useAdoFetch().post('/auth/verify-otp', {
      body: JSON.stringify({
        otp: otp.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Verification failed',
        detail: data.message || 'Invalid verification code.',
        life: 10000,
      })

      return
    }

    verifyDialogOpen.value = false

    toast.add({
      severity: 'success',
      summary: 'Welcome',
      detail: 'You have signed in successfully.',
      life: 5000,
    })

    await navigateTo('/dash')
  } catch (error) {
    console.error('OTP verification error:', error)

    toast.add({
      severity: 'error',
      summary: 'Something went wrong',
      detail: 'Please try again.',
      life: 5000,
    })
  } finally {
    verifying.value = false
  }
}
</script>

<template>
  <CVCard class="mx-auto max-w-md rounded-lg">
    <div class="mb-6 text-center">
      <div class="text-2xl font-bold lg:text-3xl">
        Sign in
      </div>

      <div class="mt-2 text-sm text-surface-500">
        Ghana only
      </div>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="login"
    >
      <InputGroup>
        <InputGroupAddon>
          233
        </InputGroupAddon>

        <InputText
          id="phone"
          v-model="form.phone"
          type="tel"
          inputmode="numeric"
          maxlength="9"
          placeholder="241234567"
          autocomplete="tel"
        />
      </InputGroup>

      <small
        v-if="form.phone.length > 0 && !isValidGhanaPhone"
        class="block text-red-500"
      >
        Enter a valid Ghanaian phone number.
      </small>

      <Button
        type="submit"
        label="Continue"
        class="w-full"
        :loading="loading"
        :disabled="!isValidGhanaPhone"
      />

      <div class="text-center text-sm text-surface-500">
        New?
        <span class="text-primary">Start here too</span>
      </div>
    </form>
  </CVCard>

  <Dialog
    v-model:visible="verifyDialogOpen"
    modal
    header="Enter verification code"
    :style="{ width: '28rem' }"
    :closable="!verifying"
  >
    <form
      class="space-y-6"
      @submit.prevent="verifyOtp"
    >
      <div class="text-sm text-surface-500">
        We sent a 6-digit verification code to

        <span class="font-semibold text-surface-900 dark:text-surface-0">
          233{{ form.phone }}
        </span>.
      </div>

      <InputOtp
        v-model="otp"
        :length="6"
        integer-only
        class="mx-auto"
      />

      <Button
        type="submit"
        label="Verify"
        class="w-full"
        :loading="verifying"
        :disabled="otp.length !== 6"
      />

      <AuthResendOtp
        :phone="`233${form.phone}`"
        @resent="otp = ''"
      />
    </form>
  </Dialog>
</template>