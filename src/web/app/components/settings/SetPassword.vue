<script setup lang="ts">
const { user } = storeToRefs(useUserStore())

const visible = ref(false)
const loading = ref(false)

const password = ref('')
const passwordConfirmation = ref('')

const toast = useToast()

const open = () => {
  password.value = ''
  passwordConfirmation.value = ''
  visible.value = true
}

const setPassword = async () => {
  if (password.value !== passwordConfirmation.value) {
    toast.add({
      severity: 'error',
      summary: 'Passwords do not match',
      detail: 'Please make sure both passwords are the same.',
      life: 5000,
    })

    return
  }

  loading.value = true

  try {
    const response = await useAdoFetch().post(
      '/user/settings/password',
      {
        body: JSON.stringify({
          password: password.value,
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to set password',
        detail: data.message || 'Please try again.',
        life: 7000,
      })

      return
    }

    user.value = data.user

    visible.value = false

    toast.add({
      severity: 'success',
      summary: 'Password set',
      detail: 'Your account password has been set.',
      life: 5000,
    })
  } catch (error) {
    console.error('Set password error:', error)

    toast.add({
      severity: 'error',
      summary: 'Something went wrong',
      detail: 'Unable to set your password. Please try again.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CVCard>
    <div class="flex items-center justify-between gap-4">
      <div>
        <div class="text-lg font-semibold">
          Account password
        </div>

        <div class="mt-1 text-sm text-surface-500">
          Add a password as another way to secure your account.
        </div>
      </div>

      <Button
        label="Set password"
        size="small"
        @click="open"
      />
    </div>
  </CVCard>

  <Dialog
    v-model:visible="visible"
    modal
    header="Set account password"
    :style="{ width: '28rem' }"
    :closable="!loading"
  >
    <form
      class="space-y-5"
      @submit.prevent="setPassword"
    >
      <FloatLabel variant="on">
        <Password
          v-model="password"
          input-id="password"
          class="w-full"
          fluid
          toggle-mask
          :feedback="true"
        />

        <label for="password">
          Password
        </label>
      </FloatLabel>

      <FloatLabel variant="on">
        <Password
          v-model="passwordConfirmation"
          input-id="password-confirmation"
          class="w-full"
          fluid
          toggle-mask
          :feedback="false"
        />

        <label for="password-confirmation">
          Confirm password
        </label>
      </FloatLabel>

      <Button
        type="submit"
        label="Set password"
        class="w-full"
        :loading="loading"
        :disabled="!password || !passwordConfirmation"
      />
    </form>
  </Dialog>
</template>