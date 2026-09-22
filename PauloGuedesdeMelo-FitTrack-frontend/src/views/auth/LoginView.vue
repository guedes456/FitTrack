<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import FormCard from '../../components/base/FormCard.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const isSubmitting = ref(false)
const apiErrorMessage = ref('')

async function handleSubmit() {
  apiErrorMessage.value = ''
  isSubmitting.value = true

  try {
    await login({
      email: form.email.trim(),
      password: form.password,
    })

    // Se o usuário chegou aqui redirecionado de uma rota protegida, volta
    // exatamente para ela (?redirect=...). Senão, vai para a rota principal
    // do projeto — ajuste "feed" se a sua tela principal tiver outro nome.
    const redirectTo = route.query.redirect || { name: 'feed' }
    router.push(redirectTo)
  } catch (error) {
    apiErrorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <FormCard title="Entrar no FitTrack">
    <form @submit.prevent="handleSubmit" novalidate>
      <BaseInput
        id="email"
        v-model="form.email"
        type="email"
        label="E-mail"
        autocomplete="email"
        required
      />

      <BaseInput
        id="password"
        v-model="form.password"
        type="password"
        label="Senha"
        autocomplete="current-password"
        required
      />

      <div v-if="apiErrorMessage" class="alert alert-danger py-2" role="alert">
        {{ apiErrorMessage }}
      </div>

      <BaseButton :loading="isSubmitting" loading-text="Entrando...">
        Entrar
      </BaseButton>
    </form>

    <p class="text-center mt-3 mb-0">
      Não tem conta? <router-link to="/register">Criar conta</router-link>
    </p>
  </FormCard>
</template>
