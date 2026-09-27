<script setup lang="ts">
const route = useRoute()

const wizardStore = useFeesManagerSetupWizardStore()

const visible = ref(false)

const accessId = computed(() => String(route.params.access_id))

const setupRoutes = [
  'fees_manager.classes',
  'fees_manager.academic-schedule',
  'fees_manager.students',
  'fees_manager.fee-schedules',
]

const accessStore = useFeesManagerAccessStore()
const { access } = storeToRefs(accessStore)

const steps = computed(() => [
  {
    key: 'class',
    title: 'Add classes',
    description: 'Create at least one class for your school.',
    icon: 'pi pi-building',
    route: {
      name: 'fees_manager.classes',
      params: {
        access_id: accessId.value,
      },
    },
  },
  {
    key: 'period',
    title: 'Start academic period',
    description: 'Set the current academic year and period.',
    icon: 'pi pi-calendar',
    route: {
      name: 'fees_manager.academic-schedule',
      params: {
        access_id: accessId.value,
      },
    },
  },
  {
    key: 'student',
    title: 'Add students',
    description: 'Add students manually or upload them.',
    icon: 'pi pi-users',
    route: {
      name: 'fees_manager.students',
      params: {
        access_id: accessId.value,
      },
    },
  },
  {
    key: 'fees',
    title: 'Add fee schedules',
    description: 'Create at least one fee schedule.',
    icon: 'pi pi-wallet',
    route: {
      name: 'fees_manager.schedule.period',
      params: {
        access_id: accessId.value,
        period_id: access.value?.school.currentAcademicPeriod?.id
      },
    },
  },
])

const activeStepIndex = computed(() => {
  return steps.value.findIndex(
    (step) => !wizardStore.state[step.key],
  )
})

function isCompleted(index: number) {
  return index < activeStepIndex.value
}

function isActive(index: number) {
  return index === activeStepIndex.value
}

function isDisabled(index: number) {
  return index > activeStepIndex.value
}

async function openWizard() {
  if (wizardStore.complete) {
    visible.value = false
    return
  }

  await wizardStore.check(accessId.value, true)

  if (!wizardStore.complete) {
    visible.value = true
  }
}

async function handleRouteChange() {
  const routeName = String(route.name)

  // Don't interrupt the user while they are inside
  // one of the setup sections.
  if (setupRoutes.includes(routeName)) {
    visible.value = false
    return
  }

  // Leaving a setup section → get completely fresh state.
  await openWizard()
}

onMounted(async () => {
  await openWizard()
})

watch(
  () => route.name,
  async () => {
    await handleRouteChange()
  },
)

watch(
  () => wizardStore.complete,
  (complete) => {
    if (complete) {
      visible.value = false
    }
  },
)

onBeforeUnmount(() => {
  wizardStore.stopPolling()
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Get started"
    :style="{ width: '32rem' }"
    :closable="true"
    :dismissable-mask="true"
  >
    <div class="space-y-5">
      <p class="text-sm leading-6 text-surface-500 dark:text-surface-400">
        Complete these steps in order to get your Fees Manager ready.
      </p>

      <div class="space-y-2">
        <div
          v-for="(step, index) in steps"
          :key="step.key"
          class="flex items-center gap-4 rounded-xl border p-4 transition-colors"
          :class="[
            isActive(index)
              ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
              : 'border-surface-200 dark:border-surface-700',

            isDisabled(index)
              ? 'opacity-50'
              : '',
          ]"
        >
          <!-- Status -->
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            :class="
              isCompleted(index)
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : isActive(index)
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500'
            "
          >
            <i
              :class="
                isCompleted(index)
                  ? 'pi pi-check'
                  : step.icon
              "
            />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <div
              class="font-semibold"
              :class="
                isDisabled(index)
                  ? 'text-surface-400 dark:text-surface-500'
                  : 'text-surface-900 dark:text-surface-0'
              "
            >
              {{ step.title }}
            </div>

            <p
              class="mt-0.5 text-xs leading-5"
              :class="
                isDisabled(index)
                  ? 'text-surface-400 dark:text-surface-500'
                  : 'text-surface-500 dark:text-surface-400'
              "
            >
              {{ step.description }}
            </p>
          </div>

          <!-- Only the active step can be opened -->
          <Button
            v-if="isActive(index)"
            label="Open"
            size="small"
            text
            icon="pi pi-arrow-right"
            icon-pos="right"
            @click="navigateTo(step.route)"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>