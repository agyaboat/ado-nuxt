<script setup lang="ts">
import { useNewEventStore } from '~/stores/new-event'

  type StructuredType = 'elite' | 'first_class' | 'second_class' | 'third_class'
  const structuredArray: StructuredType[] = ['elite', 'first_class', 'second_class', 'third_class']
  type CodeSubtype = 'random' | StructuredType

  const code_type = ref<'random' | 'structured'>()
  const code_subtype = ref('random')
  // const code_form = reactive({
  //   type: '' as CodeSubtype,
  //   value: ''
  // })

  const { form: code_form } = useNewEventStore()
  const {randomFinalised} = toRefs(useNewEventStore())

  const isStructured = computed(()=>{
    return structuredArray.includes(code_form.detail.type as StructuredType) && !!code_form.code.value
  })

  watch(()=>code_form.utils.codeBaseSelection, (v)=>{
    if(v === 'random'){
      code_form.code.type = 'random'
      getRandomCode()
    }else{
      code_form.code.type = '' as CodeSubtype
      code_form.code.value = ''
    }
  })

  watch(()=>code_form.code.type, ()=>{
    if(code_type.value === 'random'){
      return
    }
    code_form.code.value = ''
  })

  const randomFinalise = ()=>{
    if(code_form.code.type === 'random' && !!code_form.code.value){
      alert('finalised')
      code_form.code.finalised = true
    }
  }

  const toast = useToast()

  // const numRandomGen = ref(0)
  const randomLoading = ref(false)
  const recentRandomCode = ref()
  const getRandomCode = async () =>{
    if(code_form.utils.recentRandomCode) {
      code_form.code.value = code_form.utils.recentRandomCode
      return
    }
    randomLoading.value = true
    setTimeout(()=>{
      const gen = fakeRandomCode(5)
      code_form.code.value = gen //make it 6 after sometime
      code_form.utils.recentRandomCode = gen
      randomLoading.value = false
    }, 1000)
  }

  const step = ref('1')
  const callNext = (value: string)=>{
    step.value = (parseInt(step.value)+1).toString()
    // toast.add({summary: 'CallForward Called', detail: `Moving to tab ${step.value}`})
  }

  const callPrev = (value: string)=>{
    step.value = (parseInt(step.value)-1).toString()
    // toast.add({summary: 'Callback Called', detail: `Moving to tab ${step.value}`})
  }
</script>

<template>
  <div>
    <div class="flex justify-between items-center gap-5 mb-4">
      <div class="text-xl font-bold mb-2">Event Code</div>
      <div class="mb-3"><DashEventsWhyCode /></div>
    </div>
    <Stepper v-model:value="step" linear>
      <StepPanels>
        <StepPanel v-slot="{ activateCallback, value }" value="1">
          <div class="p-1 border border-dashed border-cv-zinc rounded-lg">
            <div>
              <div>Choose Code Type: </div>
              <div class="flex flex-col gap-2 p-2">
                <div class="flex items-center gap-2">
                    <RadioButton v-model="code_form.utils.codeBaseSelection" inputId="ingredient1" name="code" value="random" />
                    <label for="ingredient1">Random <span class="text-muted-color">(free forever)</span></label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton v-model="code_form.utils.codeBaseSelection" inputId="ingredient2" name="code" value="structured" />
                    <label for="ingredient2">Structured <span class="text-muted-color">(credit applies)</span></label>
                </div>
                <div class="flex justify-end">
                  <Button v-if="code_form.utils.codeBaseSelection" variant="outlined" size="small" label="Continue" @click="callNext('2')" />
                </div>
              </div>
            </div>
          </div>
        </StepPanel>
        <StepPanel v-slot="{ activateCallback, value }" value="2">
          <div class="p-2 border border-dashed border-cv-zinc rounded-lg">
            <div v-if="code_type==='random'" class="flex flex-col gap-6">
              <div class="">
                <div class="font-semibold mb-2">Random Code</div>
                <div class="text-muted-color mb-5">
                  <span v-if="randomLoading">Please wait whiles we get you a great and fitting code.</span>
                  <span v-else>Great one!!! We have got you a nice code to be used.</span>
                </div>
                <div class="flex gap-2 p-2 select-none">
                  <span class="h-8 grow p-2 bg-cv-zinc text-cv-slate rounded-lg border border-cv-slate flex justify-center items-center">
                    <span v-if="randomLoading" class="pi pi-spin pi-cog text-[5px]"></span>
                    <span v-else>{{ code_form.code.value }}</span>
                  </span>
                  <!-- <Button size="small" label="Generate" :loading="randomLoading" @click="getRandomCode" /> -->
                </div>
              </div>
              <div class="flex justify-between">
                <Button variant="outlined" severity="secondary" size="small" label="Previous" @click="callPrev('1')" />
                <div v-if="code_form.code.type === 'random' && !!code_form.code.value">
                  <Button v-if="!randomFinalised" variant="outlined" size="small" label="Finalise" @click="randomFinalise" />
                  <Button v-else variant="outlined" severity="secondary" size="small" label="Finalised" />
                </div>
              </div>
            </div>
            <div v-else-if="code_type==='structured'" class="flex flex-col gap-6">
              <div>Structured Codes</div>
              <div class="flex justify-between">
                <Button variant="outlined" severity="secondary" size="small" label="Previous" @click="callPrev('2')" />
                <Button v-if="isStructured" variant="outlined" size="small" label="Continue" @click="callNext('3')" />
              </div>
            </div>
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>

<style scoped></style>
