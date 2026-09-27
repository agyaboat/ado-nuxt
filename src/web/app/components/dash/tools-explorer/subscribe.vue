<script setup lang="ts">
import type { MarketTool } from '~/stores/dash.tools_explorer'

const props = defineProps<{
  tool: MarketTool
}>()

const schoolName = ref('')
const subscribing = ref(false)
const subscribeError = ref<string | null>(null)

const visible = ref(false)

const toast = useToast()

function open() {
  schoolName.value = ''
  subscribeError.value = null
  visible.value = true
}

async function subscribeToTool() {
  if (!schoolName.value.trim()) {
    subscribeError.value = 'School name is required.'
    return
  }

  subscribing.value = true
  subscribeError.value = null

  try {
    const res = await adofetch.post(
      `/dash/tools/market/${props.tool.id}/subscribe`,
      {
        body: JSON.stringify({
          schoolName: schoolName.value.trim(),
        }),
      },
    )

    const data = await res.json()

    if (res.ok || res.status === 201) {
      visible.value = false

      toast.add({
        severity: 'success',
        summary: 'Tool added',
        detail: `${props.tool.label} has been added to your workspace.`,
        life: 3000,
      })

      await navigateTo({
        name: props.tool.key,
        params: {
          access_id: data.accessId,
        },
      })

      return
    }

    subscribeError.value =
      data.message || 'Tool subscription failed.'

    useIsUnauthenticated(res)
  } catch (error) {
    console.error('Tool subscription error:', error)

    subscribeError.value =
      'Subscription failed. Network error!'
  } finally {
    subscribing.value = false
  }
}
</script>

<template>
  <span @click="open">
    <slot>
      <Button
        label="Subscribe"
        icon="pi pi-plus"
        icon-pos="right"
        size="small"
      />
    </slot>
  </span>

  <Dialog
    v-model:visible="visible"
    modal
    :header="`Add ${tool.label}`"
    :style="{ width: '28rem' }"
  >
    <div class="space-y-5">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Enter your school name to get started.
      </p>

      <div>
        <label
          for="school-name"
          class="mb-2 block text-sm font-semibold"
        >
          School name
        </label>

        <InputText
          id="school-name"
          v-model="schoolName"
          class="w-full"
          placeholder="Enter school name"
          :disabled="subscribing"
        />
      </div>

      <Message
        v-if="subscribeError"
        severity="error"
        :closable="false"
      >
        {{ subscribeError }}
      </Message>

      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          text
          :disabled="subscribing"
          @click="visible = false"
        />

        <Button
          label="Continue"
          :loading="subscribing"
          @click="subscribeToTool"
        />
      </div>
    </div>
  </Dialog>
</template>