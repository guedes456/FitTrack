<script setup>
import { useToast } from '../../composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <!-- Teleport para o <body>, como o BaseModal: o toast precisa aparecer na
       frente de tudo, inclusive do modal (z-index 1050), então o container
       usa z-index maior. aria-live avisa leitores de tela sem roubar o foco. -->
  <Teleport to="body">
    <div class="toast-container-app" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-${toast.type}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <span class="toast-message">{{ toast.message }}</span>
        <button type="button" class="btn-close btn-close-white" aria-label="Fechar" @click="remove(toast.id)"></button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container-app {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: min(360px, calc(100vw - 2rem));
}
.toast-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.toast-success { background: #198754; }
.toast-error { background: #dc3545; }
.toast-info { background: #0d6efd; }
.toast-message { flex: 1; }
</style>
