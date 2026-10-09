<script setup>
import { watch, onBeforeUnmount } from 'vue'

// Modal genérico: não sabe nada de treino nem de exclusão. Quem usa decide o
// conteúdo (slot padrão) e os botões (slot "footer"). Controlado de fora
// por v-model: o pai guarda se está aberto, o modal só avisa que quer fechar.
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  // Enquanto uma operação está em andamento (ex.: excluindo), o pai passa
  // `busy` para impedir que o modal seja fechado por X, clique fora ou Esc.
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  if (props.busy) return
  emit('update:modelValue', false)
  emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

// O listener de Esc só existe enquanto o modal está aberto.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <!-- Teleport leva o modal para o <body>, fora de qualquer card ou grade:
       assim ele fica centralizado na tela e não herda overflow, transform
       nem z-index dos elementos por onde a tela está montada. -->
  <Teleport to="body">
    <!-- @click.self: só fecha se o clique foi no fundo escuro; cliques
         dentro da caixa branca não "sobem" como clique no fundo. -->
    <div v-if="modelValue" class="app-modal-overlay" @click.self="close">
      <div class="app-modal-box" role="dialog" aria-modal="true" :aria-label="title">
        <header class="app-modal-header">
          <h2 class="app-modal-title">{{ title }}</h2>
          <button
            type="button"
            class="btn-close"
            aria-label="Fechar"
            :disabled="busy"
            @click="close"
          ></button>
        </header>

        <div class="app-modal-body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="app-modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.app-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.55);
}

.app-modal-box {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.app-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.5rem;
}

.app-modal-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.app-modal-body {
  padding: 0.5rem 1.25rem 1rem;
}

.app-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem 1.25rem;
}
</style>
