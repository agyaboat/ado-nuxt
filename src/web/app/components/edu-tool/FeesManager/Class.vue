<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  schoolClass: SchoolClass
}>()
const classesStore = useFeesManagerClassesStore()


const menu = ref()

const menuItems = computed(() => {
  const items = [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => edit(),
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => remove(),
    },
  ]

  if (!props.schoolClass.parentId) {
    items.push({
      label: 'Variants',
      icon: 'pi pi-sitemap',
      command: () => openVariants(),
    })
  }

  return items
})

const editVisible = ref(false)
function edit() {
  editVisible.value = !editVisible.value
}

const confirm = useConfirm()
const toast = useToast()
const api = useAdoFetch()
const route = useRoute()
const accessId = computed(()=> route.params.access_id as string)
function remove() {
  confirm.require({
    message: `Are you sure you want to delete "${props.schoolClass.label}"?`,
    header: `Delete ${props.schoolClass.label}`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    rejectProps: {
      severity: 'secondary',
      outlined: true,
    },
    acceptLabel: 'Delete',
    acceptProps: {
      severity: 'danger',
    },
    accept: deleteClass,
  })
}

async function deleteClass() {
  try {
    const response = await api.post(
      `/edutools/fees_manager/${accessId.value}/classes/${props.schoolClass.id}`,
      {
        query: {
          _method: 'DELETE',
        },
      },
    )

    const result = await response.json()

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: `Unable to delete ${props.schoolClass.label.toLowerCase()}`,
        detail: result.message ?? 'Something went wrong.',
        life: 5000,
      })
      return
    }

    await classesStore.fetchClasses(accessId.value)

    toast.add({
      severity: 'success',
      summary: `${props.schoolClass.label} deleted`,
      detail: `${props.schoolClass.label} was deleted successfully.`,
      life: 3000,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Request failed',
      detail: `Unable to delete the ${props.schoolClass.label.toLowerCase()}.`,
      life: 5000,
    })
  }
}

const variantsVisible = ref(false)

function openVariants() {
  variantsVisible.value = true
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-start justify-between p-5 pb-0">
        <div
          class="flex size-10 items-center justify-center rounded-xl
            bg-primary-50 text-primary-600
            dark:bg-primary-950 dark:text-primary-400"
        >
          <i class="pi pi-building-columns" />
        </div>

        <Button
          icon="pi pi-ellipsis-v"
          type="button"
          severity="secondary"
          text
          rounded
          @click="menu.toggle($event)"
        />

        <Menu
          ref="menu"
          :model="menuItems"
          popup
        />
      </div>
    </template>

    <template #content>
      <div>
        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0">
          {{ schoolClass.label }}
        </h3>

        <div class="flex justify-between gap-5">
          <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {{ schoolClass.studentCount }}
            {{ schoolClass.studentCount === 1 ? 'student' : 'students' }}
          </p>

          <p
            v-if="!schoolClass.parentId"
            class="mt-1 text-sm text-surface-500 dark:text-surface-400"
          >
            {{ schoolClass.variants?.length ?? 0 }}
            {{ schoolClass.variants?.length === 1 ? 'variant' : 'variants' }}
          </p>
        </div>
      </div>
    </template>
  </Card>

  <template>
      <Dialog
        v-model:visible="editVisible"
        modal
        :header="`Edit ${schoolClass.label}`"
        :style="{ width: '32rem' }"
      >
        <div>
          <EduToolFeesManagerEditClass
            :school-class="schoolClass"
            @updated="editVisible = false"
            @cancel="editVisible = false"
          />
        </div>
      </Dialog>

    <Dialog
      v-model:visible="variantsVisible"
      modal
      :header="`${schoolClass.label} Variants`"
      :style="{ width: '42rem' }"
    >
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-surface-900 dark:text-surface-0">
              {{ schoolClass.label }}
            </p>
    
            <p class="text-sm text-surface-500 dark:text-surface-400">
              {{ schoolClass.variants?.length ?? 0 }}
              {{ (schoolClass.variants?.length ?? 0) === 1 ? 'variant' : 'variants' }}
            </p>
          </div>
    
          <EduToolFeesManagerAddClass
            :parent-id="schoolClass.id"
          />
        </div>
    
        <div
          v-if="schoolClass.variants?.length"
          class="grid gap-4 sm:grid-cols-2"
        >
          <EduToolFeesManagerClass
            v-for="variant in schoolClass.variants"
            :key="variant.id"
            :school-class="variant"
          />
        </div>
    
        <div
          v-else
          class="rounded-xl border border-dashed border-surface-300 p-8 text-center dark:border-surface-700"
        >
          <p class="text-sm text-surface-500 dark:text-surface-400">
            No variants have been added yet.
          </p>
        </div>
      </div>
    </Dialog>
  </template>

</template>