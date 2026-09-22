<script setup>
import { reactive, ref, onMounted } from 'vue'
import { getMyProfile, updateProfile } from '../../services/userService'
import { getProfilePictureUrl } from '../../utils/media'
import FormCard from '../../components/base/FormCard.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const BIO_MAX = 160

const profile = ref(null)
const loadErrorMessage = ref('')

const form = reactive({
  fullName: '',
  bio: '',
})

const errors = reactive({
  fullName: '',
  bio: '',
})

// previewUrl guarda a URL local (blob) gerada só no navegador — trocar de
// foto NUNCA dispara chamada de rede sozinho; o upload de verdade só
// acontece quando o formulário é enviado.
const previewUrl = ref('')
const selectedFile = ref(null)

const isSubmitting = ref(false)
const apiErrorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  try {
    const response = await getMyProfile()
    profile.value = response.data
    form.fullName = response.data.fullName || ''
    form.bio = response.data.bio || ''
  } catch (error) {
    loadErrorMessage.value = error.message
  }
})

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) {
    return
  }

  selectedFile.value = file

  // URL.createObjectURL cria uma referência local ao arquivo, direto no
  // navegador — nenhum byte sobe pro servidor só por causa disso.
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(file)
}

function validate() {
  errors.fullName = ''
  errors.bio = ''

  if (!form.fullName.trim()) {
    errors.fullName = 'O nome completo é obrigatório.'
  }

  if (form.bio.length > BIO_MAX) {
    errors.bio = `A bio deve ter no máximo ${BIO_MAX} caracteres.`
  }

  return Object.values(errors).every((message) => message === '')
}

async function handleSubmit() {
  apiErrorMessage.value = ''
  successMessage.value = ''

  if (!validate()) {
    return
  }

  isSubmitting.value = true

  try {
    const formData = new FormData()
    formData.append('fullName', form.fullName.trim())
    formData.append('bio', form.bio.trim())
    if (selectedFile.value) {
      formData.append('profilePicture', selectedFile.value)
    }

    const response = await updateProfile(formData)
    profile.value = response.data
    successMessage.value = response.message || 'Perfil atualizado com sucesso!'

    // A foto nova já está persistida no servidor — limpamos o estado local
    // de preview/arquivo selecionado, já que profile.value agora reflete
    // a foto de verdade vinda da API.
    selectedFile.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  } catch (error) {
    apiErrorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="loadErrorMessage" class="container py-5">
    <div class="alert alert-danger" style="max-width: 480px;">
      {{ loadErrorMessage }}
    </div>
  </div>

  <FormCard v-else-if="profile" title="Meu Perfil">
    <div class="text-center mb-3">
      <img
        :src="previewUrl || getProfilePictureUrl(profile.profilePicture)"
        alt="Foto de perfil"
        class="rounded-circle"
        style="width: 120px; height: 120px; object-fit: cover;"
      />
    </div>

    <form @submit.prevent="handleSubmit" novalidate>
      <div class="mb-3">
        <label for="profilePicture" class="form-label">
          <i class="bi bi-camera me-1"></i>Foto de perfil
        </label>
        <input
          id="profilePicture"
          type="file"
          class="form-control"
          accept="image/png, image/jpeg, image/webp"
          @change="handleFileChange"
        />
      </div>

      <BaseInput
        id="fullName"
        v-model="form.fullName"
        label="Nome completo"
        :error="errors.fullName"
        required
      />

      <BaseInput
        id="bio"
        v-model="form.bio"
        label="Bio"
        multiline
        :rows="3"
        :maxlength="BIO_MAX"
        :error="errors.bio"
      />

      <p v-if="apiErrorMessage" class="alert alert-danger py-2">{{ apiErrorMessage }}</p>
      <p v-if="successMessage" class="alert alert-success py-2">{{ successMessage }}</p>

      <BaseButton variant="dark" :loading="isSubmitting" loading-text="Salvando...">
        Salvar alterações
      </BaseButton>
    </form>

    <hr />
    <p class="card-text mb-1">@{{ profile.username }}</p>
    <p class="card-text mb-0">{{ profile.email }}</p>
  </FormCard>

  <div v-else class="container py-5">
    <p>Carregando perfil...</p>
  </div>
</template>
