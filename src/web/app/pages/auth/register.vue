<script setup lang="ts">
  definePageMeta({
    name: 'auth-register'
  })

  const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  })
  const resetForm = () => {
    form.first_name = ''
    form.last_name = ''
    form.email = ''
    form.password = ''
  }

  const loading = ref(false)
  const toast = useToast()
  const register = async () => {
    console.log('Registering user with data:', form)
    loading.value = true
    try {
      const response = await useAdoFetch().post('/auth/register', {
        body: JSON.stringify(form)
      })
      const data = await response.json()
      if(response.ok) {
        toast.add({ severity: 'success', summary: 'Registration Successful', detail: 'You have registered successfully.' })
        resetForm()
        navigateTo('/dash') 
      } else {
        const errorMessage = data.message || 'Registration failed. Please try again.'
        toast.add({ severity: 'error', summary: 'Registration Failed', detail: errorMessage, life: 15000 })
        const errors = data.errors || {}
        errors.forEach((err: any) => {
          toast.add({ severity: 'error', summary: `Error in ${err.field}`, detail: err?.message, life: 15000 })
        })
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.add({ severity: 'error', summary: 'Registration Failed', detail: errorMessage, life: 5000 })
    } finally {
      loading.value = false 
    }
  }
</script>

<template>
  <CVCard class="max-w-md mx-auto rounded-lg">
   <div class="text-2xl lg:text-3xl font-bold text-center mb-5">Register</div>
   <Form class="space-y-6 mb-6" @submit="register">
    <FloatLabel variant="on">
      <InputText id="firstname" type="text" class="w-full" v-model="form.first_name" required />
      <label for="firstname">First Name</label>
    </FloatLabel>

    <FloatLabel variant="on">
      <InputText id="lastname" type="text" class="w-full" v-model="form.last_name" required />
      <label for="lastname">Last Name</label>
    </FloatLabel>

    <FloatLabel variant="on">
      <InputText id="email" type="email" class="w-full" v-model="form.email" required />
      <label for="email">Email</label>
    </FloatLabel>

    <div>
      <FloatLabel variant="on" class="mb-2">
        <!-- <InputText id="password" type="password" class="w-full" /> -->
        <Password toggleMask class="w-full" fluid v-model="form.password" required />
        <label for="password">Password</label>
      </FloatLabel>
      <!-- <Button variant="link" size="sm" class="p-0">Forgot password?</Button> -->
    </div>

    <Button type="submit" class="w-full" color="primary" :loading>Register</Button>

    <div class="text-center">
      Already have an account?
      <Button variant="link" size="sm" class="p-0 font-semibold" @click="navigateTo({name:'auth-index'})">Sign in</Button>
    </div>
   </Form>
  </CVCard>
</template>

<style scoped></style>
