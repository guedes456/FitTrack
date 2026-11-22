import { ref, watch, onMounted } from 'vue'
import { PAGE_SIZE } from '../config/constants'

// Lista paginada com "Carregar mais" (feeds e painel). `fetchPage(page, limit)`
// deve devolver a resposta da API: { data: { items, hasMore } }.
//
// Opções:
//   pageSize: itens por página (padrão PAGE_SIZE)
//   watch:    uma fonte reativa (ref/getter); quando ela muda, a lista
//             RECOMEÇA da página 1 (filtro de situação, termo da busca...).
//             A receita (`fetchPage`) lê o valor atual da fonte.
export function usePaginatedList(fetchPage, { pageSize = PAGE_SIZE, watch: source = null } = {}) {
  const items = ref([])
  const currentPage = ref(0)
  const hasMore = ref(false)
  const isLoading = ref(false)
  const error = ref('')

  // GUARDA CONTRA A RESPOSTA VELHA: cada recomeço (loadFirstPage) recebe um
  // número. Se o filtro muda de "pendentes" para "revisadas" enquanto a
  // resposta das pendentes ainda está a caminho, ela chega depois e
  // sobrescreveria a lista nova com dados do filtro antigo. Só a chamada cuja
  // numeração ainda é a última pode escrever (no try, no catch e no finally).
  let lastCallId = 0

  async function loadFirstPage() {
    const callId = ++lastCallId
    items.value = []
    currentPage.value = 0
    hasMore.value = false
    isLoading.value = true
    error.value = ''

    try {
      const response = await fetchPage(1, pageSize)
      if (callId !== lastCallId) return
      items.value = response.data.items
      currentPage.value = 1
      hasMore.value = response.data.hasMore
    } catch (err) {
      if (callId !== lastCallId) return
      error.value = err.message
    } finally {
      if (callId === lastCallId) isLoading.value = false
    }
  }

  async function loadMore() {
    // "Carregar mais" NÃO cria um número novo: ele guarda o do momento em que
    // começou e descarta a resposta se, enquanto esperava, a lista recomeçou
    // (o filtro mudou ou o "Atualizar" foi clicado).
    const callId = lastCallId
    isLoading.value = true
    error.value = ''

    try {
      const response = await fetchPage(currentPage.value + 1, pageSize)
      if (callId !== lastCallId) return
      const { items: newItems, hasMore: more } = response.data

      // Se alguém publicou um treino novo enquanto o usuário rolava, os
      // registros "deslizam" uma posição e o último da página anterior pode
      // reaparecer no começo da próxima — por isso ignoramos ids já exibidos.
      const knownIds = new Set(items.value.map((item) => item.id))
      items.value.push(...newItems.filter((item) => !knownIds.has(item.id)))

      currentPage.value += 1
      hasMore.value = more
    } catch (err) {
      if (callId !== lastCallId) return
      error.value = err.message
    } finally {
      if (callId === lastCallId) isLoading.value = false
    }
  }

  // "Atualizar": recomeça da página 1 com a lista vazia (traz o que chegou
  // depois da última carga).
  const reload = loadFirstPage

  if (source) watch(source, loadFirstPage)
  onMounted(loadFirstPage)

  return { items, hasMore, isLoading, error, loadMore, reload }
}
