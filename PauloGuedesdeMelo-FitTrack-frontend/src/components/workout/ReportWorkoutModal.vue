<script setup>
import { ref, watch } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'
import { REPORT_REASONS } from '../../config/constants'
import { reportWorkout } from '../../services/reportService'

const FORM_ID = 'report-workout-form'

// Aberto/fechado é controlado pelo pai (v-model), como no BaseModal.
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  workoutId: { type: [Number, String], required: true },
})
const emit = defineEmits(['update:modelValue', 'reported'])

const reason = ref('')
const reasonError = ref('')
// Erro da API (Offline, "Você já denunciou...") aparece AQUI, dentro do modal:
// o service é silent, então o interceptor não mostra toast.
const formError = ref('')
const isSubmitting = ref(false)

// Cada vez que o modal abre, o formulário começa limpo.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      reason.value = ''
      reasonError.value = ''
      formError.value = ''
    }
  }
)

async function handleSubmit() {
  formError.value = ''
  // Motivo obrigatório: sem ele, nenhuma requisição sai.
  if (!reason.value) {
    reasonError.value = 'Escolha um motivo para continuar.'
    return
  }
  reasonError.value = ''
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    await reportWorkout(props.workoutId, reason.value)
    emit('reported')
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
    title="Denunciar treino"
    :busy="isSubmitting"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- novalidate: a validação é a nossa (mensagem em português, sem
         requisição). O botão do rodapé fica FORA do <form>, no slot do modal, e
         aponta para ele com form="...". -->
    <form :id="FORM_ID" novalidate @submit.prevent="handleSubmit">
      <!-- fieldset disabled desabilita TODOS os rádios de uma vez enquanto
           envia; o legend é o rótulo do grupo (leitores de tela). -->
      <fieldset :disabled="isSubmitting" class="border-0 p-0 m-0">
        <legend class="h6">Qual é o motivo da denúncia?</legend>

        <div v-for="option in REPORT_REASONS" :key="option.key" class="form-check">
          <!-- Mesmo name nos cinco = grupo (só um marcado); value = a CHAVE que
               a API espera; o rótulo é só para a tela. -->
          <input
            :id="`reason-${option.key}`"
            v-model="reason"
            type="radio"
            name="reason"
            class="form-check-input"
            :value="option.key"
          />
          <label :for="`reason-${option.key}`" class="form-check-label">{{ option.label }}</label>
        </div>
      </fieldset>

      <p v-if="reasonError" class="text-danger small mt-2 mb-0" role="alert">{{ reasonError }}</p>
      <p v-if="formError" class="alert alert-danger py-2 mt-3 mb-0" role="alert">{{ formError }}</p>
    </form>

    <template #footer>
      <BaseButton type="button" variant="outline" :block="false" :loading="false" @click="emit('update:modelValue', false)">
        Cancelar
      </BaseButton>
      <BaseButton
        type="submit"
        :form="FORM_ID"
        variant="danger"
        :block="false"
        :loading="isSubmitting"
        loading-text="Enviando..."
      >
        Enviar denúncia
      </BaseButton>
    </template>
  </BaseModal>
</template>
