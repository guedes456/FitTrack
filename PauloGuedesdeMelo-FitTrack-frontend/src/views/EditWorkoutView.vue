<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getWorkoutForEdit, updateWorkout } from '../services/userService'
import { getWorkoutImageUrl } from '../utils/media'
import FormCard from '../components/base/FormCard.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

// Mesmos limites da API (config/constants.js) e da tela de Upload.
const TITLE_MAX = 60
const DESCRIPTION_MAX = 300

const route = useRoute()
const workoutId = route.params.id

const isLoading = ref(true)
const loadErrorMessage = ref('')
const currentImage = ref('')

const form = reactive({ title: '', description: '' })
const errors = reactive({ title: '', description: '' })

const selectedFile = ref(null)
const previewUrl = ref('')
const fileInput = ref(null)

const isSubmitting = ref(false)
const apiErrorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  try {
    // 403 (treino de outra pessoa) e 404 (não existe) chegam aqui como erro
    // com a mensagem da API; a tela mostra o aviso em vez de quebrar.
    const response = await getWorkoutForEdit(workoutId)
    form.title = response.data.title
    form.description = response.data.description || ''
    currentImage.value = response.data.image
  } catch (error) {
    loadErrorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) {
    selectedFile.value = null
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
    return
  }

  selectedFile.value = file
  // Prévia 100% local (blob): nenhuma chamada de rede ao escolher o arquivo.
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

function validate() {
  errors.title = ''
  errors.description = ''

  if (!form.title.trim()) {
    errors.title = 'O título é obrigatório.'
  } else if (form.title.trim().length > TITLE_MAX) {
    errors.title = `O título deve ter no máximo ${TITLE_MAX} caracteres.`
  }

  if (form.description.length > DESCRIPTION_MAX) {
    errors.description = `A descrição deve ter no máximo ${DESCRIPTION_MAX} caracteres.`
  }

  return !errors.title && !errors.description
}

async function handleSubmit() {
  apiErrorMessage.value = ''
  successMessage.value = ''

  // Validação do cliente: se falhar, nenhuma requisição sai.
  if (!validate()) return

  isSubmitting.value = true

  try {
    const formData = new FormData()
    formData.append('title', form.title.trim())
    formData.append('description', form.description.trim())
    // A imagem só vai se o usuário escolheu uma nova; sem ela, o servidor
    // mantém a atual.
    if (selectedFile.value) {
      formData.append('image', selectedFile.value)
    }

    const response = await updateWorkout(workoutId, formData)
    currentImage.value = response.data.image
    successMessage.value = response.message || 'Treino atualizado com sucesso!'

    selectedFile.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
    if (fileInput.value) fileInput.value.value = ''
  } catch (error) {
    apiErrorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isLoading" class="container py-5 text-muted">Carregando treino...</div>

  <div v-else-if="loadErrorMessage" class="container py-5">
    <div class="alert alert-danger" role="alert" style="max-width: 480px;">
      <p class="mb-2">{{ loadErrorMessage }}</p>
      <router-link to="/meus-treinos" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i>Voltar para Meus Itens
      </router-link>
    </div>
  </div>

  <FormCard v-else title="Editar Treino">
    <form @submit.prevent="handleSubmit" novalidate>
      <BaseInput id="title" v-model="form.title" label="Título" :error="errors.title" required />

      <BaseInput
        id="description"
        v-model="form.description"
        label="Descrição"
        multiline
        :rows="3"
        :maxlength="DESCRIPTION_MAX"
        :error="errors.description"
      />

      <div class="mb-3">
        <label for="image" class="form-label">
          <i class="bi bi-image me-1"></i>Imagem do treino (opcional)
        </label>
        <div class="mb-2">
          <img
            :src="previewUrl || getWorkoutImageUrl(currentImage)"
            :alt="previewUrl ? 'Prévia da nova imagem' : 'Imagem atual do treino'"
            class="thumbnail-preview"
          />
          <div class="text-muted small">
            {{ previewUrl ? 'Nova imagem (ainda não salva)' : 'Imagem atual' }}
          </div>
        </div>
        <input
          id="image"
          ref="fileInput"
          type="file"
          class="form-control"
          accept="image/png, image/jpeg, image/webp"
          @change="handleFileChange"
        />
      </div>

      <div v-if="apiErrorMessage" class="alert alert-danger py-2" role="alert">
        {{ apiErrorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success py-2" role="alert">
        {{ successMessage }}
        <router-link :to="{ name: 'treino-detail', params: { id: workoutId } }" class="alert-link">Ver treino</router-link>
        ·
        <router-link to="/meus-treinos" class="alert-link">Meus Itens</router-link>
      </div>

      <BaseButton :loading="isSubmitting" loading-text="Salvando...">Salvar alterações</BaseButton>
    </form>
  </FormCard>
</template>
