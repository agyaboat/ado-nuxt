<script setup lang="ts">
const { user } = storeToRefs(useUserStore())

const visible = ref(false)
const loading = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
})

const toast = useToast()

watch(
  () => user.value,
  (v) => {
    if (!v) {
      visible.value = false
      return
    }

    visible.value = !v.firstName && !v.lastName

    if (visible.value) {
      form.firstName = v.firstName ?? ''
      form.lastName = v.lastName ?? ''
    }
  },
  {
    immediate: true,
  },
)

const completeSetup = async () => {
  if (!form.firstName.trim() || !form.lastName.trim()) {
    return
  }

  loading.value = true

  try {
    const response = await useAdoFetch().post('/auth/v2/profile', {
      body: JSON.stringify({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      }),
      query: {_method: 'PATCH'}
    })

    const data = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to save',
        detail: data.message || 'Please try again.',
        life: 7000,
      })

      return
    }

    user.value = data.user

    visible.value = false

    toast.add({
      severity: 'success',
      summary: 'Profile ready',
      detail: 'Your ScholarSaaS profile is ready.',
      life: 4000,
    })
  } catch (error) {
    console.error('Complete setup error:', error)

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
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="false"
    :close-on-escape="false"
    :dismissable-mask="false"
    :style="{ width: '28rem' }"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary dark:bg-primary-950"
      >
        <span
          class="material-symbols-outlined"
          style="font-size: 28px;"
        >
          person
        </span>
      </div>

      <div class="text-2xl font-bold">
        Complete your profile
      </div>

      <p class="mt-2 text-sm leading-6 text-surface-500">
        Just a few details before you get started.
      </p>
    </div>

    <Form
      class="mt-6 space-y-5"
      @submit="completeSetup"
    >
      <FloatLabel variant="on">
        <InputText
          id="first-name"
          v-model="form.firstName"
          class="w-full"
          autocomplete="given-name"
        />

        <label for="first-name">
          First name
        </label>
      </FloatLabel>

      <FloatLabel variant="on">
        <InputText
          id="last-name"
          v-model="form.lastName"
          class="w-full"
          autocomplete="family-name"
        />

        <label for="last-name">
          Last name
        </label>
      </FloatLabel>

      <Button
        type="submit"
        label="Continue"
        class="w-full"
        :loading="loading"
        :disabled="!form.firstName.trim() || !form.lastName.trim()"
      />
    </Form>
  </Dialog>
</template>