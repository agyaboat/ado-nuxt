<script setup lang="ts">
const visible = ref(false)
const loading = ref(false)

const currentPassword = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const { user } = storeToRefs(useUserStore())


const toast = useToast()

const open = () => {
  currentPassword.value = ''
  password.value = ''
  passwordConfirmation.value = ''
  visible.value = true
}

const changePassword = async () => {
  if (password.value !== passwordConfirmation.value) {
    toast.add({
      severity: 'error',
      summary: 'Passwords do not match',
      detail: 'Please make sure both new passwords are the same.',
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
          currentPassword: currentPassword.value,
          password: password.value,
        }),
        query: {
          _method: 'PATCH',
        },
      },
    )

    const data = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to change password',
        detail: data.message || 'Please try again.',
        life: 7000,
      })

      return
    }

    visible.value = false
    
    user.value = data.user
    toast.add({
      severity: 'success',
      summary: 'Password changed',
      detail: 'Your password has been changed successfully.',
      life: 5000,
    })
  } catch (error) {
    console.error('Change password error:', error)

    toast.add({
      severity: 'error',
      summary: 'Something went wrong',
      detail: 'Unable to change your password. Please try again.',
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
          Change the password you use to secure your account.
        </div>
      </div>

      <Button
        label="Change password"
        size="small"
        variant="outlined"
        @click="open"
      />
    </div>
  </CVCard>

  <Dialog
    v-model:visible="visible"
    modal
    header="Change password"
    :style="{ width: '28rem' }"
    :closable="!loading"
  >
    <form
      class="space-y-5 mt-4"
      @submit.prevent="changePassword"
    >
      <FloatLabel variant="on">
        <Password
          v-model="currentPassword"
          input-id="current-password"
          class="w-full"
          fluid
          toggle-mask
          :feedback="false"
          autocomplete="current-password"
        />

        <label for="current-password">
          Current password
        </label>
      </FloatLabel>

      <FloatLabel variant="on">
        <Password
          v-model="password"
          input-id="new-password"
          class="w-full"
          fluid
          toggle-mask
          :feedback="true"
          autocomplete="new-password"
        />

        <label for="new-password">
          New password
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
          autocomplete="new-password"
        />

        <label for="password-confirmation">
          Confirm new password
        </label>
      </FloatLabel>

      <Button
        type="submit"
        label="Change password"
        class="w-full"
        :loading="loading"
        :disabled="
          !currentPassword ||
          !password ||
          !passwordConfirmation
        "
      />
    </form>
  </Dialog>
</template>