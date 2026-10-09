import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Chama `handler` sempre que o usuário clica FORA do elemento apontado por
 * `targetRef` (um ref de template). Serve para fechar menus suspensos,
 * popovers etc.
 *
 * O ref deve apontar para um wrapper que contenha o botão que abre E o
 * conteúdo aberto: assim, o clique no próprio botão conta como "dentro" e
 * não fecha o menu na mesma hora em que ele acabou de abrir.
 *
 * O listener fica no document e é removido quando o componente é
 * desmontado, para não acumular listeners a cada vez que a tela é criada.
 */
export function useClickOutside(targetRef, handler) {
  function onDocumentClick(event) {
    const element = targetRef.value
    if (!element || element.contains(event.target)) {
      return
    }
    handler(event)
  }

  onMounted(() => document.addEventListener('click', onDocumentClick))
  onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
}
