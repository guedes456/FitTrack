import { ref, watch, onMounted } from 'vue'

// Carrega dados ao montar a tela (e de novo quando um parâmetro muda).
// Substitui o esqueleto isLoading / errorMessage / try-catch-finally que
// cada tela repetia.
//
// `fetcher` é uma FUNÇÃO: useAsyncData(() => getWorkoutById(id)). Passar
// getWorkoutById(id) (sem o () =>) chamaria a API na hora, uma única vez, e
// entregaria só a Promise: o composable não teria como repetir a chamada
// quando o parâmetro mudasse nem como controlar quando ela começa.
//
// Opções:
//   watch: função que devolve o que, ao mudar, dispara nova carga
//          (ex.: () => route.params.id)
//   immediate: carrega já ao montar (padrão true)
export function useAsyncData(fetcher, { watch: watchSource, immediate = true } = {}) {
  const data = ref(null)
  const error = ref('')
  const isLoading = ref(immediate)

  // CORRIDA ENTRE RESPOSTAS: o usuário abre o treino 1 e, antes de a
  // resposta chegar, abre o treino 2. Se a resposta do 1 (mais lenta) chegar
  // por último, ela sobrescreveria a do 2 e a tela mostraria o treino
  // errado. Cada chamada leva um número; só a MAIS RECENTE pode escrever.
  let lastCallId = 0

  async function load() {
    const callId = ++lastCallId
    isLoading.value = true
    error.value = ''
    data.value = null

    try {
      const result = await fetcher()
      if (callId !== lastCallId) return
      data.value = result
    } catch (err) {
      if (callId !== lastCallId) return
      error.value = err.message
    } finally {
      if (callId === lastCallId) isLoading.value = false
    }
  }

  if (watchSource) {
    watch(watchSource, load, { immediate })
  } else if (immediate) {
    onMounted(load)
  }

  return { data, error, isLoading, reload: load }
}
