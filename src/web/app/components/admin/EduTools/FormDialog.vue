<script setup lang="ts">
import type {
  toolPayload,
  EduTool,
  EduToolPayload,
  EduToolStatus,
  EduToolType,
} from '~/stores/admin.edutools'

const props = defineProps<{
  visible: boolean
  tool?: EduTool | null
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  create: [payload: toolPayload]
  update: [id: string, payload: toolPayload]
}>()

const form = reactive({
  key: '',
  label: '',
  description: '',
  type: 'tool' as EduToolType,
  category: '',
  status: 'active' as EduToolStatus,
  isMarketVisible: true,
  sortOrder: null as number | null,

  imageJson: '',
  requirementsJson: '',
  pagesJson: '',
  defaultConfigJson: '',
  metaJson: '',
})

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Deprecated', value: 'deprecated' },
  { label: 'Archived', value: 'archived' },
]

const typeOptions = [
  { label: 'Tool', value: 'tool' },
  { label: 'Suite', value: 'suite' },
]

const categoryOptions = [
  'finance',
  'academic',
  'communication',
  'operations',
  'analytics',
  'integrations',
  'suite',
  'other',
]

const isEditing = computed(() => Boolean(props.tool?.id))

function stringifyJson(value: unknown) {
  if (!value) return ''
  return JSON.stringify(value, null, 2)
}

function parseJson(value: string, fallback: any = null) {
  if (!value?.trim()) return fallback
  return JSON.parse(value)
}

function resetForm() {
  form.key = ''
  form.label = ''
  form.description = ''
  form.type = 'tool'
  form.category = ''
  form.status = 'active'
  form.isMarketVisible = true
  form.sortOrder = null

  form.imageJson = ''
  form.requirementsJson = ''
  form.pagesJson = ''
  form.defaultConfigJson = ''
  form.metaJson = ''
}

function fillForm(tool: EduTool) {
  form.key = tool.key
  form.label = tool.label
  form.description = tool.description || ''
  form.type = tool.type || 'tool'
  form.category = tool.category || ''
  form.status = tool.status || 'active'
  form.isMarketVisible = Boolean(tool.isMarketVisible)
  form.sortOrder = tool.sortOrder ?? null

  form.imageJson = stringifyJson(tool.image)
  form.requirementsJson = stringifyJson(tool.requirements)
  form.pagesJson = stringifyJson(tool.pages)
  form.defaultConfigJson = stringifyJson(tool.defaultConfig)
  form.metaJson = stringifyJson(tool.meta)
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return

    if (props.tool) {
      fillForm(props.tool)
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

watch(
  () => props.tool,
  (tool) => {
    if (!props.visible) return

    if (tool) {
      fillForm(tool)
    } else {
      resetForm()
    }
  }
)

function closeDialog() {
  emit('update:visible', false)
}

function buildPayload(): EduToolPayload {
  return {
    key: form.key.trim(),
    label: form.label.trim(),
    description: form.description || null,
    type: form.type,
    category: form.category || null,
    status: form.status,
    is_market_visible: form.isMarketVisible,
    sort_order: form.sortOrder,
    isFeatured: false,

    image: parseJson(form.imageJson, null),
    requirements: parseJson(form.requirementsJson, null),
    pages: parseJson(form.pagesJson, null),
    default_config: parseJson(form.defaultConfigJson, null),
    meta: parseJson(form.metaJson, null),
  }
}

const toast = useToast()

async function submit() {
  if (!form.key.trim() || !form.label.trim()) {
    alert('Tool key and label are required.')
    return
  }

  let payload: EduToolPayload

  try {
    payload = buildPayload()
  } catch {
    alert('One of the JSON fields is invalid.')
    return
  }

  if (props.tool?.id) {
    emit('update', props.tool.id, {payload, toast})
  } else {
    emit('create', {payload, toast})
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="isEditing ? 'Edit Tool' : 'Register Tool'"
    class="w-[95vw] md:w-212.5"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="font-semibold">Key</label>
        <InputText
          v-model="form.key"
          placeholder="fees_manager"
          class="w-full"
        />
      </div>

      <div class="space-y-2">
        <label class="font-semibold">Label</label>
        <InputText
          v-model="form.label"
          placeholder="Fees Manager"
          class="w-full"
        />
      </div>

      <div class="space-y-2">
        <label class="font-semibold">Type</label>
        <Select
          v-model="form.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="space-y-2">
        <label class="font-semibold">Category</label>
        <Select
          v-model="form.category"
          :options="categoryOptions"
          placeholder="Select category"
          class="w-full"
        />
      </div>

      <div class="space-y-2">
        <label class="font-semibold">Status</label>
        <Select
          v-model="form.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="space-y-2">
        <label class="font-semibold">Sort Order</label>
        <InputNumber
          v-model="form.sortOrder"
          class="w-full"
        />
      </div>

      <div class="md:col-span-2 flex items-center gap-3">
        <ToggleSwitch v-model="form.isMarketVisible" />

        <span class="font-semibold">
          Show in tools market
        </span>
      </div>

      <div class="md:col-span-2 space-y-2">
        <label class="font-semibold">Description</label>
        <Textarea
          v-model="form.description"
          rows="3"
          class="w-full"
        />
      </div>

      <div class="md:col-span-2 space-y-2">
        <label class="font-semibold">Image JSON</label>
        <Textarea
          v-model="form.imageJson"
          rows="4"
          class="w-full font-mono text-sm"
          placeholder='{ "url": "https://cdn...", "key": "tools/fees-manager.png" }'
        />
      </div>

      <div class="md:col-span-2 space-y-2">
        <label class="font-semibold">Requirements JSON</label>
        <Textarea
          v-model="form.requirementsJson"
          rows="5"
          class="w-full font-mono text-sm"
          placeholder='{ "default_required": ["school_id", "academic_period_id"] }'
        />
      </div>

      <div class="md:col-span-2 space-y-2">
        <label class="font-semibold">Pages JSON</label>
        <Textarea
          v-model="form.pagesJson"
          rows="5"
          class="w-full font-mono text-sm"
          placeholder='[{ "key": "home", "label": "Overview" }]'
        />
      </div>

      <div class="md:col-span-2 space-y-2">
        <label class="font-semibold">Default Config JSON</label>
        <Textarea
          v-model="form.defaultConfigJson"
          rows="5"
          class="w-full font-mono text-sm"
        />
      </div>

      <div class="md:col-span-2 space-y-2">
        <label class="font-semibold">Meta JSON</label>
        <Textarea
          v-model="form.metaJson"
          rows="4"
          class="w-full font-mono text-sm"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          text
          @click="closeDialog"
        />

        <Button
          :label="isEditing ? 'Save Changes' : 'Create Tool'"
          :loading="saving"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>