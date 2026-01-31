<script setup lang="ts">
  // const props = defineProps<{user: User}>()
  const basePaF = {
    current: null as string | null,
    new: null as string | null,
    confirm: null as string | null,
  }
  const passwordForm = reactive(basePaF)

  // onMounted(() => {
  //   Object.assign(passwordForm, basePaF)
  // })
</script>

<template>
  <Card v-if="false">
    <template #header>
      <div class="text-lg font-bold flex gap-2 items-center p-3 border-b border-cv-slate">
        <span class="material-symbols-outlined text-primary">security</span>
        <div>Security</div>
      </div>
    </template>

    <template #content>
      <div class="p-3">
        <div>
          <div class="font-bold">Two-Factor Authentication (2FA)</div>
          <div class="flex justify-between items-center gap-6">
            <div class="flex-1 text-sm text-muted-color">
              Add an extra layer of security to your account
              by requiring just a password to login
            </div>
            <div>
              <ToggleSwitch />
              <div class="italic text-xs text-center text-primary">saving..</div>
            </div>
          </div>
        </div>

        <Divider />

        <div class="space-y-5">
          <div class="text-muted-color">CHANGE PASSWORD</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FloatLabel variant="on">
              <Password fluid id="event_title" v-model="passwordForm.current" toggle-mask :feedback="false" />
              <label for="event_title">Current Password</label>
            </FloatLabel>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FloatLabel variant="on">
              <Password fluid id="event_title" v-model="passwordForm.new" toggle-mask />
              <label for="event_title">New Password</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <Password fluid id="event_title" v-model="passwordForm.confirm" toggle-mask :feedback="false" />
              <label for="event_title">Confirm New Password</label>
            </FloatLabel>
          </div>
          <div class="text-right">
            <Button severity="secondary" label="Update Password" />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
