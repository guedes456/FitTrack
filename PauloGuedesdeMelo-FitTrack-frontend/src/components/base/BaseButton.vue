<script setup>
// BaseButton evita repetir, em cada formulário, a mesma lógica de
// "disabled enquanto isSubmitting" + texto trocando pra um estado de
// carregamento. O componente que usa BaseButton só passa :loading e
// o texto de cada estado.
defineProps({
  type: { type: String, default: 'submit' },
  variant: { type: String, default: 'brand' }, // 'brand' | 'dark' | 'outline'
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Enviando...' },
  block: { type: Boolean, default: true },
})

const variantClass = {
  brand: 'btn-brand',
  dark: 'btn-dark',
  outline: 'btn-outline-secondary',
}
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[variantClass[variant] || 'btn-brand', { 'w-100': block }]"
    :disabled="loading"
  >
    <span
      v-if="loading"
      class="spinner-border spinner-border-sm me-2"
      role="status"
      aria-hidden="true"
    ></span>
    <template v-if="loading">{{ loadingText }}</template>
    <slot v-else />
  </button>
</template>
