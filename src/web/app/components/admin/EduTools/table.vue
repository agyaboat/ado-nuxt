<script setup lang="ts">
import type { ToastServiceMethods } from 'primevue';
import type { EduTool, EduToolStatus } from '~/stores/admin.edutools'

defineProps<{
  tools: EduTool[]
  loading?: boolean
  saving?: boolean
  deleting?: boolean
}>()

const toast = useToast()

const emit = defineEmits<{
  edit: [id: string]
  status: [id: string, status: EduToolStatus]
  delete: [{id: string, toast: ToastServiceMethods}]
}>()

function statusSeverity(status: EduToolStatus) {
  if (status === 'active') return 'success'
  if (status === 'deprecated') return 'warn'
  if (status === 'archived') return 'secondary'
  return 'danger'
}

const confirm = useConfirm()
function confirmDelete(tool: EduTool) {
  confirm.require({
    message: `Are you sure you want to delete ${tool.label}?`,
    header: 'Delete tool',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptClass: 'p-button-danger',
    accept: () => emit('delete', {id:tool.id, toast}),
    reject: () => {
      
    },
  })
  // const ok = confirm(
  //   `Delete ${tool.label}? Only do this if the tool has no subscriptions.`
  // )

  // if (!ok) return

  // emit('delete', tool.id)
}
</script>

<template>
  <Card>
    <template #content>
      <DataTable
        :value="tools"
        :loading="loading"
        data-key="id"
        paginator
        :rows="10"
        responsive-layout="scroll"
      >
        <template #empty>
          <div class="text-center py-10">
            <p class="font-bold">
              No tools registered yet.
            </p>

            <p class="text-muted-color text-sm mt-1">
              Register your first ScholarSaaS tool.
            </p>
          </div>
        </template>

        <Column field="label" header="Tool">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <Avatar
                v-if="data.image?.url"
                :image="data.image.url"
                shape="circle"
              />

              <Avatar
                v-else
                icon="pi pi-box"
                shape="circle"
              />

              <div>
                <p class="font-bold">
                  {{ data.label }}
                </p>

                <p class="text-xs text-muted-color">
                  {{ data.key }}
                </p>
              </div>
            </div>
          </template>
        </Column>

        <Column field="type" header="Type">
          <template #body="{ data }">
            <Tag :value="data.type" severity="info" />
          </template>
        </Column>

        <Column field="category" header="Category">
          <template #body="{ data }">
            <span class="capitalize">
              {{ data.category || '—' }}
            </span>
          </template>
        </Column>

        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.status"
              :severity="statusSeverity(data.status)"
            />
          </template>
        </Column>

        <Column field="isMarketVisible" header="Market">
          <template #body="{ data }">
            <Tag
              :value="data.isMarketVisible ? 'Visible' : 'Hidden'"
              :severity="data.isMarketVisible ? 'success' : 'secondary'"
            />
          </template>
        </Column>

        <Column header="Usage">
          <template #body="{ data }">
            <div>
              <p class="font-semibold">
                {{ data.activeInstancesCount || 0 }} active
              </p>

              <p class="text-xs text-muted-color">
                {{ data.instancesCount || 0 }} total
              </p>
            </div>
          </template>
        </Column>

        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex items-center gap-1">
              <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="secondary"
                :disabled="saving || deleting"
                @click="emit('edit', data.id)"
              />

              <Button
                v-if="data.status !== 'active'"
                icon="pi pi-check"
                rounded
                text
                severity="success"
                :disabled="saving || deleting"
                @click="emit('status', data.id, 'active')"
              />

              <Button
                v-if="data.status === 'active'"
                icon="pi pi-ban"
                rounded
                text
                severity="warn"
                :disabled="saving || deleting"
                @click="emit('status', data.id, 'deprecated')"
              />

              <Button
                v-if="data.status !== 'archived'"
                icon="pi pi-archive"
                rounded
                text
                severity="secondary"
                :disabled="saving || deleting"
                @click="emit('status', data.id, 'archived')"
              />

              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                :loading="deleting"
                :disabled="saving"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>