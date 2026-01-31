
<template>
    <div class="">
        <span @click="visible = true"><slot /></span>
        <Dialog v-model:visible="visible" maximizable modal :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <template #header>
                <div class="flex gap-3 items-center">
                    <div class="p-1 rounded-lg bg-cv-emerald flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl! md:text-3xl! text-cv-emerald">group</span>
                    </div>
                    <div class="">
                        <div class="text-lg font-bold">Users Management</div>
                        <div class="text-muted-color">Review</div>
                    </div>
                </div>
            </template>
            <div>
                <!-- {{ model.data.list }} -->
                <DataTable :sort-mode="'multiple'" :value="model.data.list" table-style="min-width: 50rem" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :loading="model.data.loading">
                    <Column header="View">
                        <template #body="slotProps">
                            <DashRolesUsersItem :user="slotProps.data" />
                           <!-- <span class="material-symbols-outlined text-lg text-cv-emerald cursor-pointer">multimodal_hand_eye</span> -->
                        </template>
                    </Column>
                    <Column header="User">
                        <template #body="slotProps">
                            <div class="flex gap-2 items-center">
                                <Avatar :image="slotProps.data.avatar" shape="circle" size="large" />
                                <div class="space-y-0.5">
                                    <div>{{ slotProps.data.firstName }} {{ slotProps.data.lastName }}</div>
                                    <div class="text-xs text-muted-color">{{ slotProps.data.email }}</div>
                                </div>
                            </div>
                        </template>
                    </Column>
                    <Column header="Verification">
                        <template #body="slotProps">
                            <Badge v-if="slotProps.data.emailVerifiedAt" severity="success" value="Verified" />
                            <Badge v-else severity="danger" value="Unverified" />
                        </template>
                    </Column>
            
                    <Column header="Status" field="status" />
                    <Column header="Role" field="profile" />
                    <Column header="Date Joined" field="joinedAt" />

                </DataTable>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
const visible = ref(false);

const { model, checkData } = useRoleUsersStore()

onMounted(() => {
  checkData('all')
})
</script>
