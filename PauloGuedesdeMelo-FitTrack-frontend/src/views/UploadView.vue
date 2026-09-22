<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createWorkout } from '../services/workoutService'
import FormCard from '../components/base/FormCard.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

const TITLE_MAX = 60
const DESCRIPTION_MAX = 300

const router = useRouter()

const form = reactive({
  title: '',
  description: '',
})

const errors = reactive({
  title: '',
  description: '',
  image: '',
})

const selectedFile = ref(null)
const previewUrl = ref('')

const isSubmitting = ref(false)
const uploadPercent = ref(0)
const apiErrorMessage = ref('')
const successMessage = ref('')

function handleFileChange(event) {
  errors.image = ''
  const file = event.target.files[0]
  if (!file) {
    selectedFile.value = null
    previewUrl.value = ''
    return
  }

  selectedFile.value = file

  // URL.createObjectURL só cria uma referência local ao arquivo no
  // navegador — a prévia aparece na hora, sem nenhuma chamada de rede.
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(file)
}

function validate() {
  errors.title = ''
  errors.description = ''
  errors.image = ''

  if (!form.title.trim()) {
    errors.title = 'O título é obrigatório.'
  } else if (form.title.trim().length > TITLE_MAX) {
    errors.title = `O título deve ter no máximo ${TITLE_MAX} caracteres.`
  }

  if (form.description.length > DESCRIPTION_MAX) {
    errors.description = `A descrição deve ter no máximo ${DESCRIPTION_MAX} caracteres.`
  }

  if (!selectedFile.value) {
    errors.image = 'A imagem do treino é obrigatória.'
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
  uploadPercent.value = 0

  try {
    const formData = new FormData()
    formData.append('title', form.title.trim())
    formData.append('description', form.description.trim())
    formData.append('image', selectedFile.value)

    await createWorkout(formData, (progressEvent) => {
      // onUploadProgress do Axios entrega { loaded, total } em bytes — o
      // total só vem preenchido quando o tamanho do corpo é conhecido de
      // antemão, o que é sempre o caso aqui (arquivo já selecionado antes
      // do envio). Convertendo pra porcentagem dá o valor que a
      // .progress-bar precisa pra largura em %.
      if (progressEvent.total) {
        uploadPercent.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    successMessage.value = 'Treino enviado com sucesso!'

    setTimeout(() => {
      router.push({ name: 'feed' })
    }, 1200)
  } catch (error) {
    apiErrorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <FormCard title="Enviar Treino" max-width="480px">
    <form @submit.prevent="handleSubmit" novalidate>
      <BaseInput
        id="title"
        v-model="form.title"
        label="Título"
        :maxlength="TITLE_MAX"
        :error="errors.title"
        required
      />

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
          <i class="bi bi-image me-1"></i>Imagem do treino
        </label>
        <input
          id="image"
          type="file"
          class="form-control"
          :class="{ 'is-invalid': errors.image }"
          accept="image/png, image/jpeg, image/webp"
          @change="handleFileChange"
        />
        <span v-if="errors.image" class="text-danger small">{{ errors.image }}</span>

        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Prévia da imagem selecionada"
          class="thumbnail-preview mt-2"
        />
      </div>

      <div v-if="isSubmitting" class="mb-3">
        <div class="progress" style="height: 10px;">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: uploadPercent + '%' }"
            :aria-valuenow="uploadPercent"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        <span class="text-muted small">{{ uploadPercent }}%</span>
      </div>

      <div v-if="apiErrorMessage" class="alert alert-danger py-2" role="alert">
        {{ apiErrorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success py-2" role="alert">
        {{ successMessage }}
      </div>

      <BaseButton :loading="isSubmitting" loading-text="Enviando...">
        Enviar Treino
      </BaseButton>
    </form>
  </FormCard>
</template>
