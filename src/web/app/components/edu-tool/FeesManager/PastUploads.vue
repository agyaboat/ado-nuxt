<script setup lang="ts">
import { ref } from 'vue'

interface StudentUpload {
  id: string
  class: {
    id: string
    label: string
  }
  totalStudents: number
  status: 'running' | 'success' | 'failed'
  errorMessage: string | null
  completedAt: string | null
  createdAt: string
}

const visible = ref(false)
const loading = ref(false)
const uploads = ref<StudentUpload[]>([])
const error = ref<string | null>(null)

function open() {
  visible.value = true
  fetchUploads()
}

const route = useRoute()

const accessId = route.params.access_id as string
const api = useAdoFetch()

async function fetchUploads() {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/edutools/fees_manager/${accessId}/students/uploads`)
    const result = await response.json()

    if (!response.ok) {
      error.value = result.message ?? 'Unable to load recent uploads.'
      return
    }

    uploads.value = result.data ?? []
  } catch (err) {
    console.error('Unable to load student uploads.', err)
    error.value = 'Unable to load recent uploads.'
  } finally {
    loading.value = false
  }
}
function formatDate(value: string | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function statusSeverity(status: StudentUpload['status']) {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'danger'
  return 'warn'
}

const deleteUpload = (data: any) => {}
</script>

<template>
  <span @click="open">
    <slot>
      <Button label="Recent Uploads" icon="pi pi-history" severity="secondary" outlined />
    </slot>
  </span>

  <Dialog v-model:visible="visible" modal header="Recent Uploads" :style="{ width: '900px', maxWidth: '95vw' }">
    <div class="space-y-4">
      <div>
        <p class="text-sm text-surface-500">
          View student uploads previously submitted for this school.
        </p>
      </div>

      <Message v-if="error" severity="error" :closable="false">
        {{ error }}
      </Message>

      <div v-if="loading" class="flex min-h-48 items-center justify-center">
        <ProgressSpinner style="width: 32px; height: 32px" stroke-width="4" />
      </div>

      <div v-else-if="uploads.length === 0" class="flex min-h-48 flex-col items-center justify-center text-center">
        <i class="pi pi-history mb-3 text-3xl text-surface-400" />

        <p class="font-medium text-surface-700">
          No uploads yet
        </p>

        <p class="mt-1 text-sm text-surface-500">
          Student uploads for this school will appear here.
        </p>
      </div>

      <DataTable v-else :value="uploads" striped-rows>
        <Column header="Class">
          <template #body="{ data }">
            {{ data.class.label }}
          </template>
        </Column>

        <Column header="Students">
          <template #body="{ data }">
            {{ data.totalStudents }}
          </template>
        </Column>

        <Column header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
          </template>
        </Column>

        <Column header="Uploaded">
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>

        <Column header="Completed">
          <template #body="{ data }">
            {{ formatDate(data.completedAt) }}
          </template>
        </Column>

        <Column header="" style="width: 80px">
          <template #body="{ data }">
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              type="button"
              aria-label="Delete upload"
              @click="deleteUpload(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>
</template>