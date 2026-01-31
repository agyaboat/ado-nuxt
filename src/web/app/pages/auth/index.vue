<script setup lang="ts">
  definePageMeta({
    name: 'auth-index'
  })
  const form = reactive({
    email: '',
    password: ''
  })

  const loading = ref(false)
  const toast = useToast()
  const login = async () => {
    console.log('Logging in user with data:', form)
    loading.value = true
    try {
      const response = await useAdoFetch().post('/auth', {
        body: JSON.stringify(form)
      })
      const data = await response.json()
      if(response.ok) {
        toast.add({ severity: 'success', summary: 'Login Successful', detail: 'You have logged in successfully.', life: 5000 })
        // navigateTo('/dash', { external: true })
        navigateTo('/dash')
      } else {
        const errorMessage = data.message || 'Login failed. Please try again.'
        toast.add({ severity: 'error', summary: 'Login Failed', detail: errorMessage, life: 15000 })
        const errors = data.errors || {}
        errors.forEach((err: any) => {
          toast.add({ severity: 'error', summary: err.field? `Error in ${err.field}`:'Error', detail: err?.message, life: 15000 })
        })
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
      toast.add({ severity: 'error', summary: 'Login Failed', detail: errorMessage, life: 5000 })
    } finally {
      loading.value = false 
    }
  }
</script>


<template>
  <CVCard class="max-w-md mx-auto rounded-lg">
   <div class="text-2xl lg:text-3xl font-bold text-center mb-5">Log in</div>
   <Form class="space-y-6 mb-6" @submit="login">
    <FloatLabel variant="on">
      <InputText id="email" type="email" v-model="form.email" class="w-full" />
      <label for="email">Email</label>
    </FloatLabel>

    <div>
      <FloatLabel variant="on" class="mb-2">
        <Password id="password" v-model="form.password" class="w-full" toggle-mask fluid :feedback="false" />
        <label for="password">Password</label>
      </FloatLabel>
      <Button variant="link" size="sm" class="p-0">Forgot password?</Button>
    </div>

    <Button type="submit" class="w-full" color="primary" :loading="loading">Log in</Button>

    <div class="text-center">
      Don't have an account?
      <Button variant="link" size="sm" class="p-0 font-semibold" @click="navigateTo({name:'auth-register'})">Sign up</Button>
    </div>
   </Form>
  </CVCard>
</template>

<style scoped></style>
