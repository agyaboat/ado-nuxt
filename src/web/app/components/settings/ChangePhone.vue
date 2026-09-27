<script setup lang="ts">
const { user } = storeToRefs(useUserStore())

const visible = ref(false)
const loading = ref(false)
const verifying = ref(false)
const otpSent = ref(false)

const phone = ref('')
const password = ref('')
const otp = ref('')

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

const isValidPhone = computed(() => {
  if (!/^\d{9}$/.test(phone.value)) {
    return false
  }

  return ghanaPrefixes.some((prefix) =>
    phone.value.startsWith(prefix),
  )
})

const requiresPassword = computed(() => user.value?.passwordSet === true)

const canRequestChange = computed(() => {
  if (!isValidPhone.value) {
    return false
  }

  if (requiresPassword.value && !password.value) {
    return false
  }

  return true
})

const toast = useToast()

const open = () => {
  phone.value = ''
  password.value = ''
  otp.value = ''
  otpSent.value = false
  visible.value = true
}

const requestChange = async () => {
  if (!canRequestChange.value) {
    return
  }

  loading.value = true

  try {
    const response = await useAdoFetch().post(
      '/user/settings/phone/change/request',
      {
        body: JSON.stringify({
          phone: `233${phone.value}`,
          ...(requiresPassword.value
            ? { password: password.value }
            : {}),
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to continue',
        detail: data.message || 'Please try again.',
        life: 7000,
      })

      return
    }

    // Only move to the OTP step after the request succeeds.
    otp.value = ''
    otpSent.value = true
  } catch (error) {
    console.error('Phone change request error:', error)

    toast.add({
      severity: 'error',
      summary: 'Something went wrong',
      detail: 'Unable to send the verification code. Please try again.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const confirm = async () => {
  if (otp.value.length !== 6) {
    return
  }

  verifying.value = true

  try {
    const response = await useAdoFetch().post(
      '/user/settings/phone/change',
      {
        body: JSON.stringify({
          phone: `233${phone.value}`,
          otp: otp.value,
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to change phone',
        detail: data.message || 'Please try again.',
        life: 7000,
      })

      return
    }

    user.value = data.user
    visible.value = false

    toast.add({
      severity: 'success',
      summary: 'Phone number updated',
      detail: 'Your phone number has been updated.',
      life: 5000,
    })
  } catch (error) {
    console.error('Phone change confirmation error:', error)

    toast.add({
      severity: 'error',
      summary: 'Something went wrong',
      detail: 'Unable to change your phone number. Please try again.',
      life: 5000,
    })
  } finally {
    verifying.value = false
  }
}
</script>

<template>
  <CVCard>
    <div class="flex items-center justify-between gap-4">
      <div class="min-w-0">
        <div class="text-lg font-semibold">
          Phone number
        </div>

        <div class="mt-1 text-sm text-surface-500">
          {{ user?.phone || 'Not set' }}
        </div>
      </div>

      <Button
        label="Change"
        size="small"
        variant="outlined"
        @click="open"
      />
    </div>
  </CVCard>

  <Dialog
    v-model:visible="visible"
    modal
    header="Change phone number"
    :style="{ width: '28rem' }"
    :closable="!verifying"
  >
    <form class="space-y-6" @submit.prevent="confirm">
    
    <!-- Phone step -->
      <template v-if="!otpSent">
        <div class="space-y-2">
          <label class="text-sm">New Phone Number</label>

          <InputGroup>
            <InputGroupAddon>
              233
            </InputGroupAddon>

            <InputText
              v-model="phone"
              type="tel"
              inputmode="numeric"
              maxlength="9"
              placeholder="241234567"
            />
          </InputGroup>

          <small
            v-if="phone.length > 0 && !isValidPhone"
            class="block text-red-500"
          >
            Enter a valid Ghanaian phone number.
          </small>
        </div>

        <FloatLabel
          v-if="requiresPassword"
          variant="on"
        >
          <Password
            v-model="password"
            input-id="current-phone-password"
            class="w-full"
            fluid
            toggle-mask
            :feedback="false"
            autocomplete="current-password"
          />

          <label for="current-phone-password">
            Current password
          </label>
        </FloatLabel>

        <Button
          type="button"
          label="Send verification code"
          class="w-full"
          :loading="loading"
          :disabled="!canRequestChange"
          @click="requestChange"
        />
      </template>

      <!-- OTP step -->
      <template v-else>
        <div class="text-sm text-surface-500">
          Enter the verification code sent to
          <strong>233{{ phone }}</strong>.
        </div>

        <InputOtp
          v-model="otp"
          :length="6"
          integer-only
          class="mx-auto"
        />

        <Button
          type="submit"
          label="Confirm phone number"
          class="w-full"
          :loading="verifying"
          :disabled="otp.length !== 6"
        />
      </template>
    </form>
  </Dialog>
</template>