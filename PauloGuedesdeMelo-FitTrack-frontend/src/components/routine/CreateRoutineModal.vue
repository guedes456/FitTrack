<script setup>
import { ref, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'
import { LIMITS } from '../../config/constants'
import { createRoutine } from '../../services/routineService'

const FORM_ID = 'create-routine-form'

// Aberto/fechado é controlado pelo pai (v-model), como no BaseModal.
const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'created'])

const title = ref('')
const description = ref('')
// Privada por padrão: quem esquece de marcar não expõe a rotina sem querer.
const isPublic = ref(false)

const titleError = ref('')
const descriptionError = ref('')
// Erro da API (ex.: Offline) aparece AQUI, dentro do modal, e não em toast:
// o service é silent e o usuário vê o problema junto do formulário.
const formError = ref('')
const isSubmitting = ref(false)

// Cada vez que o modal abre, o formulário começa limpo.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      title.value = ''
      description.value = ''
      isPublic.value = false
      titleError.value = ''
      descriptionError.value = ''
      formError.value = ''
    }
  }
)

// Os limites valem para o texto SEM espaços nas pontas (a API também faz trim).
function validate() {
  const trimmedTitle = title.value.trim()
  const trimmedDescription = description.value.trim()

  titleError.value = ''
  descriptionError.value = ''

  if (trimmedTitle.length < LIMITS.ROUTINE_TITLE_MIN || trimmedTitle.length > LIMITS.ROUTINE_TITLE_MAX) {
    titleError.value = `O título deve ter entre ${LIMITS.ROUTINE_TITLE_MIN} e ${LIMITS.ROUTINE_TITLE_MAX} caracteres.`
  }
  if (trimmedDescription.length > LIMITS.ROUTINE_DESCRIPTION_MAX) {
    descriptionError.value = `A descrição deve ter no máximo ${LIMITS.ROUTINE_DESCRIPTION_MAX} caracteres.`
  }
  return !titleError.value && !descriptionError.value
}

async function handleSubmit() {
  formError.value = ''
  // Validou e falhou: nenhuma requisição sai.
  if (!validate() || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const response = await createRoutine({
      title: title.value.trim(),
      description: description.value.trim(),
      isPublic: isPublic.value,
    })
    emit('created', response.data)
    emit('update:modelValue', false)
  } catch (error) {
    formError.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Nova rotina"
    :busy="isSubmitting"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- novalidate: a validação é a nossa (mensagens em português, no campo),
         não a do navegador. O botão do rodapé fica FORA do <form>, no slot
         do modal, e por isso aponta para ele com form="..." -->
    <form :id="FORM_ID" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        id="routine-title"
        v-model="title"
        label="Título"
        :maxlength="LIMITS.ROUTINE_TITLE_MAX"
        :error="titleError"
        autocomplete="off"
      />
      <BaseInput
        id="routine-description"
        v-model="description"
        label="Descrição (opcional)"
        multiline
        :rows="3"
        :maxlength="LIMITS.ROUTINE_DESCRIPTION_MAX"
        :error="descriptionError"
      />

      <div class="form-check mb-2">
        <input id="routine-public" v-model="isPublic" type="checkbox" class="form-check-input" />
        <label for="routine-public" class="form-check-label">
          Pública <span class="text-muted small">(qualquer pessoa com o link pode ver)</span>
        </label>
      </div>

      <p v-if="formError" class="alert alert-danger py-2 mb-0" role="alert">{{ formError }}</p>
    </form>

    <template #footer>
      <BaseButton type="button" variant="outline" :block="false" :loading="false" @click="emit('update:modelValue', false)">
        Cancelar
      </BaseButton>
      <BaseButton
        type="submit"
        :form="FORM_ID"
        :block="false"
        :loading="isSubmitting"
        loading-text="Criando..."
      >
        Criar rotina
      </BaseButton>
    </template>
  </BaseModal>
</template>
