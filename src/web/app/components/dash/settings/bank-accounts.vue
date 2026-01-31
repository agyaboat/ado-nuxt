<script setup lang="ts">
import type { BankConfirmData } from './bank-account-confirm.vue'

  // const props = defineProps<{user: User}>()
  const {bankAccounts, loading:bankAccountsLoading, fetchError:backAccountFetchError} = storeToRefs(useUserBankAccountsStore())
  const {banks, loading:bankListLoading, fetchError} = storeToRefs(useBankListStore())
  const {checkBanks} = useBankListStore()
  const {checkAccounts, fetchAccounts} = useUserBankAccountsStore()


  onMounted(()=>{
    checkBanks()
    checkAccounts()
  })

  const selectedBank = ref<PaystackBank | null>(null)
  const confirmData = ref<BankConfirmData | null>(null)
  // confirmData.value = {
  //   accountName: 'Bb',
  //   accountNumber: '090',
  //   bankCode: '909',
  //   bankName: 'MTN',
  //   type: 'mobile_money',
  // }

  const baseForm = {
    // accountName: null as string | null,
    bankCode: null as string | null,
    bankName: null as string | null,
    accountNumber: null as string | null,
    type: null as 'mobile_money' | 'ghipss' | null
  }
  const form = reactive(baseForm)

  const resetForm = ()=>{
    Object.assign(form, {...baseForm})
  }

  watch(()=> selectedBank.value, (v) => {
    if(v){
      form.bankCode = v.code
      form.bankName = v.name
    }
  })

  const {user} = storeToRefs(useUserStore())

  const loading = ref(false)
  const toast = useToast()

  const resolveAccount = async () =>{
    if(!user.value?.emailVerifiedAt){
      toast.add({severity:'error', summary: 'Error', detail: 'Completely account verification first', life: 5000})
      return
    }
    if(!form.type || !form.bankCode || !form.accountNumber){
      toast.add({severity:'warn', summary: 'Error', detail: 'Completely fill the form first', life: 5000})
      return
    }
    loading.value = true
    try {
      const res = await useAdoFetch().post(`/dash/user/bank-accounts/resolve`, {
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if(res.ok){
        form.type = null
        resetForm()
        // fetchAccounts()
        // toast.add({severity:'success', summary: 'Success', detail: `Account added successfully.`, life: 5000})
        confirmData.value = data
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

  const accountType = [
    {label: 'Mobile Money', value: 'mobile_money'},
    {label: 'Bank', value: 'ghipss'},
  ]

  const filteredList = ref<PaystackBank[]>([])
  
  watch(()=> banks.value, (v) => {
    if(v){
      filteredList.value = v
    }else{
      checkBanks()
    }
  }, {immediate: true})

  watch(()=>form.type, (nv)=>{
    if(banks.value){
      //omit bank of ghana
      filteredList.value = banks.value.filter((b) => b.type === nv && b.code !== '010100')
      form.bankCode = ''
      form.bankName = ''
      selectedBank.value = null
      form.accountNumber = ''
    }else{
      checkBanks()
    }
  })
</script>

<template>
  <Card>
    <template #header>
      <div class="text-lg font-bold flex gap-5 justify-between items-center p-3 border-b border-cv-slate">
        <div class="flex gap-2 items-center">
          <span class="material-symbols-outlined text-primary">account_balance</span>
          <div>Bank Accounts Setup</div>
        </div>
        <div class="p-1 rounded-xl text-cv-amber bg-cv-amber border border-cv-amber text-xs font-semibold">Payout <span class="hidden md:inline">Destination</span></div>
      </div>
    </template>

    <template #content>
      <!-- {{ form }} -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-5 lg:gap-8">
        <div>
          <div class="text-muted-color font-semibold mb-4">ADD NEW ACCOUNT</div>
          <!-- {{ banks }} - {{ fetchError }} - {{ bankListLoading }} -->
          <Form @submit="resolveAccount" class="flex flex-col items-center gap-6 min-h-40">
            <FloatLabel variant="on">
              <Select :options="accountType" option-label="label" option-value="value" fluid id="event_title" v-model="form.type" required />
              <label for="event_title">Account Type</label>
            </FloatLabel>
            <FloatLabel variant="on" v-if="form.type">
              <Select :options="filteredList" option-label="name" filter fluid id="event_title" v-model="selectedBank" required />
              <label for="event_title">{{ form.type === 'mobile_money' ? 'Choose Momo Provider' : form.type === 'ghipss' ? 'Select Bank' : 'Select Provider' }}</label>
            </FloatLabel>
            <FloatLabel variant="on" v-if="form.bankCode">
              <InputText fluid id="event_title" v-model="form.accountNumber" required />
              <label for="event_title">{{ form.type === 'mobile_money' ? 'Momo Number' : 'Account Number'}}</label>
            </FloatLabel>
            <!-- <FloatLabel variant="on" v-if="form.accountNumber">
              <InputText fluid id="event_title" v-model="form.accountName" required />
              <label for="event_title">Account Name</label>
            </FloatLabel> -->
            <div class="w-full">
              <Button type="submit" v-if="user?.emailVerifiedAt" fluid label="Add Account" icon="pi pi-plus" severity="secondary" :loading />
              <div v-else class="bg-cv-slate text-cv-slate p-2 rounded-lg border-cv-slate text-red-400! text-center">Complete Account Verification First</div>
            </div>
          </Form>

          <DashSettingsBankAccountConfirm :details="confirmData" @cancel="resetForm; confirmData = null" @account:added="resetForm; confirmData = null" />
        </div>
        <div class="">
          <div class="text-muted-color font-semibold mb-4">SAVED ACCOUNTS</div>
          <div class="space-y-5 md:px-3">
            <div v-for="acc in bankAccounts" class="flex justify-between gap-5 items-center p-3 shadow bg-slate-100/50 dark:bg-slate-950/50  rounded-lg  border-cv-gray">
              <div class="flex gap-3 items-center ">
                <div class="p-2 bg-cv-slate rounded-full flex flex-col items-center justify-center">
                  <!-- <span class="material-symbols-outlined" :class="{'text-primary': acc.primary}">payments</span> -->
                  <span class="material-symbols-outlined text-primary">payments</span>
                </div>
                <div class="space-y-0 5">
                  <div>{{ acc.accountName }}</div>
                  <div class="text-muted-color text-sm flex flex-col gap-1.5">
                    <span>{{ acc.bankName }}</span>
                    <!-- <span>•</span> -->
                    <span class="font-bold">{{ acc.accountNumber }}</span>
                    <!-- <span v-if="acc.primary">•</span>
                    <span v-if="acc.primary">Primary</span> -->
                  </div>
                </div>
              </div>
              <div class="">
                <Button size="small" variant="link" severity="secondary" icon="pi pi-chevron-right" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
