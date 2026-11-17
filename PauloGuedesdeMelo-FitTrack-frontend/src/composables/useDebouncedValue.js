import { ref, watch, onUnmounted } from 'vue'

// DEBOUNCE: devolve uma cópia de `source` que só muda depois de `delay` ms
// SEM nenhuma mudança nova. Digitar "supino" sem pausa muda `source` seis
// vezes, mas a cópia muda UMA vez, 400 ms depois da última tecla.
//
// (Não confundir com o lastCallId do useAsyncData: o debounce EVITA requisições
// desnecessárias; o lastCallId descarta a resposta atrasada de uma requisição
// que já saiu. Os dois problemas são diferentes e as defesas se somam.)
export function useDebouncedValue(source, delay) {
  // Valor inicial = o valor atual da origem: se a tela abre com ?q=supino,
  // a busca já começa com "supino", sem esperar 400 ms nem passar por "".
  const debounced = ref(source.value)
  let timer = null

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  // Sair da tela com um timer pendente atualizaria um valor que ninguém mais usa.
  onUnmounted(() => clearTimeout(timer))

  return debounced
}
