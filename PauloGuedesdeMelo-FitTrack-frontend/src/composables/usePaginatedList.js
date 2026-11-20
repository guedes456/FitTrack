import { ref, onMounted } from 'vue'
import { PAGE_SIZE } from '../config/constants'

// Lista paginada com "Carregar mais" (feeds). `fetchPage(page, limit)` deve
// devolver a resposta da API: { data: { items, hasMore } }.
export function usePaginatedList(fetchPage, { pageSize = PAGE_SIZE } = {}) {
  const items = ref([])
  const currentPage = ref(0)
  const hasMore = ref(false)
  const isLoading = ref(false)
  const error = ref('')

  // Mesma proteção contra corrida do useAsyncData: se duas páginas forem
  // pedidas quase juntas, só a chamada mais recente escreve na lista.
  let lastCallId = 0

  async function loadPage(page) {
    const callId = ++lastCallId
    isLoading.value = true
    error.value = ''

    try {
      const response = await fetchPage(page, pageSize)
      if (callId !== lastCallId) return
      const { items: newItems, hasMore: more } = response.data

      // Se alguém publicou um treino novo enquanto o usuário rolava, os
      // registros "deslizam" uma posição e o último da página anterior pode
      // reaparecer no começo da próxima — por isso ignoramos ids já exibidos.
      const knownIds = new Set(items.value.map((item) => item.id))
      items.value.push(...newItems.filter((item) => !knownIds.has(item.id)))

      currentPage.value = page
      hasMore.value = more
    } catch (err) {
      if (callId !== lastCallId) return
      error.value = err.message
    } finally {
      if (callId === lastCallId) isLoading.value = false
    }
  }

  const loadMore = () => loadPage(currentPage.value + 1)

  // "Atualizar": recomeça da página 1 com a lista vazia (traz o que chegou
  // depois da última carga). O lastCallId do loadPage descarta qualquer
  // resposta antiga que ainda estivesse a caminho.
  function reload() {
    items.value = []
    currentPage.value = 0
    hasMore.value = false
    return loadPage(1)
  }

  onMounted(() => loadPage(1))

  return { items, hasMore, isLoading, error, loadMore, reload }
}
