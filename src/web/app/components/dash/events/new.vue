<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue'
import { useNewEventStore } from '~/stores/new-event'

  const visible = ref(false)
  const toast = useToast()
  const step = ref('1')
  const callNext = (value: string)=>{
    step.value = (parseInt(step.value)+1).toString()
  }

  const callPrev = (value: string)=>{
    step.value = (parseInt(step.value)-1).toString()
  }

  const { form, createNew, resetForm } = useNewEventStore()
  // const {randomFinalised} = toRefs(useNewEventStore())

  const step1Complete = computed(()=> form.detail.title && form.detail.institution && form.detail.logo)
  
  const src = ref();

  function onFileSelect(event: FileUploadSelectEvent) {
      const file = event.files[0]
      // form.detail.logo = file
      console.log(file)
      const reader = new FileReader();

      reader.onload = async (e) => {
          src.value = e.target?.result;
      };

      reader.readAsDataURL(file);
      compressImage(file).then((compressed) => {
        form.detail.logo = compressed as any
      })
  }
  const clearImg = ()=>{
    src.value = undefined
    form.detail.logo = ''
  }
  const timeMessage = "The time is in 24hour format. For example 3:00pm is equivalent to 15:00 here."
  const timeInfo = ()=> alert(timeMessage)

  const el = useTemplateRef('scrollIntoView')
  watch(()=>step.value, (v)=>{
    el.value?.scrollIntoView({behavior:'smooth'})
  })

  // const loading = ref(false)

  const create = async () =>{
    const prev = reactive({...form.detail})
    // console.log('dATE: ', new Date(prev.startDate!).toISOString())
    if (prev.startDate && prev.endDate && prev.startDate > prev.endDate) {
      toast.add({severity:'error', summary: 'User Error', detail: 'The end date cannot be earlier than the start date'})
      return
    }
    prev.startDate? prev.startDate = new Date(prev.startDate!).getTime() as any : ''
    prev.endDate? prev.endDate = new Date(prev.endDate!).getTime() as any : ''
    form.utils.createNewLoading = true
    // await createNew()
    // 
    // console.log(form)
    // 
    const formData = new FormData()
    Object.entries(prev).forEach(([k, v]) => {
      if(!v){
        return
      }
      formData.append(k, v)
    })
    try {
      const res = await useAdoFetch().post('/dash/events', {
        body: formData
      })
      const data = await res.json()
      if(res.ok){
        resetForm()
        toast.add({severity:'success', summary: 'Event Created', detail: `Your event "${prev.title}" has been created successfully.`})
        step.value = '1'
        const { refreshAllStores } = useEventsDraftStore()
        refreshAllStores()
      }else{
        useIsUnauthenticated(res)
        if(res.status == 422){
          useToastErrors(toast, data.errors??[])
        }else{
          toast.add({severity:'error', summary: 'Event Creation failed', detail: data?.message || 'An error occured while creating this event. Please check and try again.'})
        }
      }
    } catch (err) {
      toast.add({severity:'error', summary: 'Network Error', detail: 'Network error occured. Please check your connection and try again'})
      console.error(err)
    }finally{
      form.utils.createNewLoading = false
    }
  }

</script>

<template>
  <div>
    <span @click="visible = !visible">
      <slot>
        <Button label="Create Event" icon="pi pi-plus" :loading="useNewEventStore().form.utils.createNewLoading" fluid />
      </slot>
    </span>
    <Dialog v-model:visible="visible" header="New Event" :modal="true" :style="{ width: '28rem' }" :breakpoints="{ '460px': '90vw' }" >
      <!-- <div>{{ form }}</div> -->
      <Stepper v-model:value="step" linear class="basis-200 relative">
        <div class="z-20 sticky top-0 bg-white dark:bg-slate-900">
          <StepList>
              <Step value="1">Type</Step>
              <Step value="2">Details</Step>
              <!-- <Step value="3">Code</Step> -->
               <!-- Implement this after some time -->
          </StepList>
          <div class="bg-slate-400 p-px"></div>
        </div>
        <div ref="scrollIntoView"></div>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback, value }" value="1">
              <div class="py-4">
                <div class="flex justify-between items-center mb-3">
                  <div class="text-lg font-semibold">Choose Event type:</div>
                  <DashEventsNewWhyType />
                </div>
                <div class="flex">
                  <Select v-model:model-value="form.detail.type" fluid :options="['pageantry', 'award']" placeholder="Choose event type here" />
                </div>
              </div>
              <div class="flex pt-6 justify-end">
                  <Button v-if="form.detail.type" label="Next" icon="pi pi-arrow-right" iconPos="right" @click="callNext('2')" />
              </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback, value }" value="2">
            <div class="text-xl font-bold mb-5">Event Details</div>
            <div class="py-4 flex flex-col gap-5">
              <FloatLabel variant="on">
                <InputText fluid id="event_title" v-model="form.detail.title" />
                <label for="event_title">Event Title</label>
              </FloatLabel>
              <FloatLabel variant="on" v-if="form.detail.title">
                <InputText fluid id="event_inst" v-model="form.detail.institution" />
                <label for="event_inst">Institution</label>
              </FloatLabel>
              <div v-if="form.detail.institution">
                <!-- <div class="font-bold mb-3">Logo: </div> -->
                <div class="flex gap-5 mb-2">
                  <FileUpload mode="basic" :chooseLabel="form.detail.logo?'Change logo':'Add Logo'" @select="onFileSelect" customUpload auto  accept="image/*" :maxFileSize="10000000" />
                  <div class="flex items-center">
                    <Button v-if="form.detail.logo" label="Remove" @click="clearImg" size="small" severity="secondary" />
                  </div>
                </div>
                <div v-if="src" class="shadow-md rounded-xl max-w-sm overflow-hidden">
                  <div class="h-52 overflow-hidden">
                    <img :src="src" class="h" alt="Image" />
                  </div>
                </div>
              </div>

              <div class="flex gap-4" v-if="form.detail.logo">
                <FloatLabel variant="on" class="grow">
                  <DatePicker fluid id="event_start_date" v-model="form.detail.startDate as null" showTime hourFormat="12" />
                  <label for="event_start_date">Start Date</label>
                </FloatLabel>
                <!-- <div class="flex gap-2 items-center" v-if="form.detail.startDate">
                  <FloatLabel variant="on" class="grow">
                    <DatePicker timeOnly fluid id="event_start_time" v-model="form.detail.startTime as null" />
                    <label for="event_start_time">Time</label>
                  </FloatLabel>
                  <span class="cursor-pointer material-symbols-outlined pi pi-info-circle" @click="timeInfo"></span>
                </div> -->
              </div>

              <div class="flex gap-4" v-if="form.detail.startDate">
                <FloatLabel variant="on" class="grow">
                  <DatePicker fluid id="event_end_date" v-model="form.detail.endDate as null" showTime hourFormat="12" />
                  <label for="event_end_date">End Date</label>
                </FloatLabel>
                <!-- <div class="flex gap-2 items-center" v-if="form.detail.endDate">
                  <FloatLabel variant="on" class="grow">
                    <DatePicker time-only fluid id="event_end_time" v-model="form.detail.endTime as null" :min-date="new Date(form.detail.startDate!)" />
                    <label for="event_end_time">Time</label>
                  </FloatLabel>
                  <span class="cursor-pointer material-symbols-outlined pi pi-info-circle" @click="timeInfo"></span>
                </div> -->
              </div>
            </div>
            <div class="flex pt-6 justify-between">
                <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="callPrev('1')" />
                <!-- <Button v-if="step1Complete" label="Next" icon="pi pi-arrow-right" iconPos="right" @click="" /> -->
                <Button v-if="step1Complete" label="Create Event" icon="pi pi-check" iconPos="right" :loading="form.utils.createNewLoading" @click="create" />
            </div>
          </StepPanel>
          <!-- <div>
            <StepPanel v-slot="{ activateCallback, value }" value="3">
              <DashEventsNewCode />
              <div class="pt-6 flex justify-between">
                  <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="callPrev('2')" />
                  <Button label="Create Event" icon="pi pi-check" v-if="randomFinalised" />
              </div>
            </StepPanel>
          </div> -->
          <!-- Implement this after some time -->
        </StepPanels>
      </Stepper>
    </Dialog>
  </div>
</template>

<style scoped></style>
