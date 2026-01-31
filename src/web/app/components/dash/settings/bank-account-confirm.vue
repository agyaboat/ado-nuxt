<script setup lang="ts">
  const {user} = storeToRefs(useUserStore());
  // const {checkBanks} = useBankListStore()
  const {fetchAccounts} = useUserBankAccountsStore()

  const visible = ref(false)
  const toast = useToast()

  export interface BankConfirmData {
    accountName: string | null,
    bankCode: string | null,
    bankName: string | null,
    accountNumber: string | null,
    type: 'mobile_money' | 'ghipss'
  }

  const props = defineProps<{details: BankConfirmData | null}>()
  watch(()=> props.details, (nv)=>{
    if(nv){
      visible.value = true
    }else{
      visible.value = false
    }
  }, {immediate: true})

  const emits = defineEmits()

  const loading = ref(false)

  const addAccount = async () =>{
    if(!user.value?.emailVerifiedAt){
      toast.add({severity:'error', summary: 'Error', detail: 'Completely account verification first', life: 5000})
      return
    }
    if(!props.details || !props.details.type || !props.details.bankCode || !props.details.accountNumber || !props.details.accountName){
      toast.add({severity:'warn', summary: 'Error', detail: 'Completely fill the form first', life: 5000})
      return
    }
    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/user/bank-accounts`, {
        body: JSON.stringify(props.details)
      })
      const data = await res.json()
      if(res.ok){
        emits('account:added')
        fetchAccounts()
        toast.add({severity:'success', summary: 'Success', detail: `Account added successfully.`, life: 5000})
      }else{
        useIsUnauthenticated(res)
        toast.add({severity:'error', summary: 'Failed', detail: data?.message || 'Adding account failed', life: 10000})
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Network Error', detail: 'Network error occured. Please check your connection and try again', life: 10000})
      console.error(err)
    }finally{
      loading.value = false
    }
  }


</script>

<template>
  <div>
    <!-- <slot>
      <Button @click="visible = !visible" label="verify now" size="small" severity="warn" variant="link" class="text-amber-500 dark:text-amber-400 font-semibold!" :loading />
    </slot> -->
    <slot />
    <Dialog v-model:visible="visible" header="Confirm Account" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
      <div class="space-y-6" v-if="details">
        <div class="">
          <div class="font-bold">Bank/ Provider:</div>
          <div>{{ details.bankName }}</div>
        </div>

        <div class="">
          <div class="font-bold">Account Number:</div>
          <div>{{ details.accountNumber }}</div>
        </div>

        <div class="">
          <div class="font-bold">Account Name:</div>
          <div>{{ details.accountName }}</div>
        </div>

        <div class="flex justify-between gap-6">
          <Button label="Cancel" severity="danger" @click="$emit('cancel')" />
          <Button label="Confirm" @click="addAccount" :loading />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
