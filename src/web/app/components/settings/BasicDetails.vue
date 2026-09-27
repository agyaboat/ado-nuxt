<script setup lang="ts">
const { user } = storeToRefs(useUserStore())

const form = reactive({
  firstName: '',
  middleName: '',
  lastName: '',
})

const loading = ref(false)
const toast = useToast()

watch(
  () => user.value,
  (value) => {
    if (!value) return

    form.firstName = value.firstName ?? ''
    form.middleName = value.middleName ?? ''
    form.lastName = value.lastName ?? ''
  },
  { immediate: true },
)

const save = async () => {
  loading.value = true

  try {
    const response = await useAdoFetch().post(
      '/user/settings/basic-details',
      {
        body: JSON.stringify(form),
        query: {_method: 'PATCH'}
      },
    )

    const data = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Unable to save',
        detail: data.message || 'Failed to update your details.',
        life: 7000,
      })

      return
    }

    user.value = data.user

    toast.add({
      severity: 'success',
      summary: 'Details updated',
      detail: 'Your basic details have been updated.',
      life: 5000,
    })
  } catch (error) {
    console.error('Update basic details error:', error)

    toast.add({
      severity: 'error',
      summary: 'Something went wrong',
      detail: 'Failed to update your details. Please try again.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CVCard class="">
    <div class="mb-6">
      <div class="text-lg font-semibold">
        Basic details
      </div>

      <div class="mt-1 text-sm text-surface-500">
        Keep your personal information up to date.
      </div>
    </div>

    <Form class="space-y-5" @submit="save">
      <FloatLabel variant="on">
        <InputText
          id="first-name"
          v-model="form.firstName"
          class="w-full"
          autocomplete="given-name"
        />
        <label for="first-name">First name</label>
      </FloatLabel>

      <FloatLabel variant="on">
        <InputText
          id="middle-name"
          v-model="form.middleName"
          class="w-full"
          autocomplete="additional-name"
        />
        <label for="middle-name">Middle name</label>
      </FloatLabel>

      <FloatLabel variant="on">
        <InputText
          id="last-name"
          v-model="form.lastName"
          class="w-full"
          autocomplete="family-name"
        />
        <label for="last-name">Last name</label>
      </FloatLabel>

      <div class="flex justify-end">
        <Button
          type="submit"
          label="Save changes"
          :loading="loading"
        />
      </div>
    </Form>
  </CVCard>
</template>