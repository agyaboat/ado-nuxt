<script setup lang="ts">
const route = useRoute()

definePageMeta({
  name: 'fees_manager.settings',
})

const accessStore = useFeesManagerAccessStore()
const { access } = storeToRefs(accessStore)

const loading = ref(false)
const saving = ref(false)

const toast = useToast()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  website: '',

  country: '',
  region: '',
  town: '',

  address: '',
})

watch(
  () => access.value,
  (value) => {
    if (!value) return

    const school = value.school
    const venue = school.venueDetails

    form.name = school.name ?? ''
    form.phone = school.phone ?? ''
    form.email = school.email ?? ''
    form.website = school.website ?? ''

    form.country = venue?.country ?? ''
    form.region = venue?.region ?? ''
    form.town = venue?.town ?? ''
    form.address = venue?.address ?? ''
  },
  { immediate: true },
)

onMounted(async () => {
  if (!access.value) {
    loading.value = true

    try {
      await accessStore.check(String(route.params.access_id))
    } finally {
      loading.value = false
    }
  }
})

async function save() {
  saving.value = true

  try {
    const response = await useAdoFetch().post(
      `/edutools/fees_manager/${route.params.access_id}/settings`,
      {
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          website: form.website.trim() || null,

          country: form.country.trim() || null,
          region: form.region.trim() || null,
          town: form.town.trim() || null,

          venueDetails: {
            country: form.country.trim() || null,
            region: form.region.trim() || null,
            town: form.town.trim() || null,
            address: form.address.trim() || null,
          },
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
        summary: 'Unable to save',
        detail: data.message || 'Unable to update school settings.',
        life: 6000,
      })

      return
    }

    // Keep the local access context in sync.
    if (data.data) {
      accessStore.access = data.data
    }

    toast.add({
      severity: 'success',
      summary: 'Settings saved',
      detail: 'Your school settings have been updated.',
      life: 4000,
    })
  } catch (error) {
    console.error('Fees Manager settings error:', error)

    toast.add({
      severity: 'error',
      summary: 'Something went wrong',
      detail: 'Unable to save your settings. Please try again.',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="w-full">
    <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1
          class="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-0"
        >
          Settings
        </h1>

        <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Manage your school information and location details.
        </p>
      </div>

      <Skeleton
        v-if="loading"
        height="32rem"
      />

      <form
        v-else
        class="space-y-6"
        @submit.prevent="save"
      >
        <!-- School information -->
        <Card>
          <template #title>
            School information
          </template>

          <template #subtitle>
            Basic contact information for your school.
          </template>

          <template #content>
            <div class="grid gap-5">
              <div>
                <label
                  for="school-name"
                  class="mb-2 block text-sm font-medium"
                >
                  School name
                </label>

                <InputText
                  id="school-name"
                  v-model="form.name"
                  class="w-full"
                  placeholder="School name"
                  :disabled="saving"
                />
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    for="school-phone"
                    class="mb-2 block text-sm font-medium"
                  >
                    Phone
                  </label>

                  <InputText
                    id="school-phone"
                    v-model="form.phone"
                    class="w-full"
                    placeholder="School phone number"
                    :disabled="saving"
                  />
                </div>

                <div>
                  <label
                    for="school-email"
                    class="mb-2 block text-sm font-medium"
                  >
                    Email
                  </label>

                  <InputText
                    id="school-email"
                    v-model="form.email"
                    type="email"
                    class="w-full"
                    placeholder="school@example.com"
                    :disabled="saving"
                  />
                </div>
              </div>

              <div>
                <label
                  for="school-website"
                  class="mb-2 block text-sm font-medium"
                >
                  Website
                </label>

                <InputText
                  id="school-website"
                  v-model="form.website"
                  class="w-full"
                  placeholder="https://example.com"
                  :disabled="saving"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Location -->
        <Card>
          <template #title>
            Location
          </template>

          <template #subtitle>
            Where your school is located.
          </template>

          <template #content>
            <div class="grid gap-5 sm:grid-cols-3">
              <div>
                <label
                  for="country"
                  class="mb-2 block text-sm font-medium"
                >
                  Country
                </label>

                <InputText
                  id="country"
                  v-model="form.country"
                  class="w-full"
                  placeholder="Ghana"
                  :disabled="saving"
                />
              </div>

              <div>
                <label
                  for="region"
                  class="mb-2 block text-sm font-medium"
                >
                  Region
                </label>

                <InputText
                  id="region"
                  v-model="form.region"
                  class="w-full"
                  placeholder="Region"
                  :disabled="saving"
                />
              </div>

              <div>
                <label
                  for="town"
                  class="mb-2 block text-sm font-medium"
                >
                  Town / City
                </label>

                <InputText
                  id="town"
                  v-model="form.town"
                  class="w-full"
                  placeholder="Town or city"
                  :disabled="saving"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Venue -->
        <Card>
          <template #title>
            Venue details
          </template>

          <template #subtitle>
            Add the street, landmark, or other address details.
          </template>

          <template #content>
            <Textarea
              id="venue-address"
              v-model="form.address"
              rows="4"
              class="w-full"
              placeholder="e.g. Along Kintampo-Techiman Road, near..."
              :disabled="saving"
            />
          </template>
        </Card>

        <div class="flex justify-end">
          <Button
            type="submit"
            label="Save changes"
            icon="pi pi-check"
            :loading="saving"
          />
        </div>
      </form>
    </div>
  </main>
</template>