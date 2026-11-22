<script setup>
import BaseModal from './BaseModal.vue'

// Confirmação genérica sobre o BaseModal: não sabe nada de usuário nem de
// treino. Quem usa passa o texto e decide o que acontece em `confirm`.
// É montado com v-if (a variável "o que será confirmado" é o interruptor E o
// dado do modal), por isso o BaseModal recebe :model-value="true" fixo.
defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirmar' },
  // 'danger' (padrão) | 'brand' | 'dark' | 'outline' (classes do BaseButton).
  confirmVariant: { type: String, default: 'danger' },
  // Chamada em andamento: trava o X, o Esc, o clique fora e os dois botões.
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'close'])

const variantClass = {
  brand: 'btn-brand',
  dark: 'btn-dark',
  outline: 'btn-outline-secondary',
  danger: 'btn-danger',
}
</script>

<template>
  <BaseModal :model-value="true" :title="title" :busy="busy" @close="emit('close')">
    <p class="mb-0">{{ message }}</p>

    <template #footer>
      <button type="button" class="btn btn-outline-secondary" :disabled="busy" @click="emit('close')">
        Cancelar
      </button>
      <button
        type="button"
        class="btn"
        :class="variantClass[confirmVariant] || 'btn-danger'"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ busy ? 'Aguarde...' : confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>
