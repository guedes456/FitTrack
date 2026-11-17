// ATUALIZAÇÃO OTIMISTA, em três passos — extraída aqui no TERCEIRO caso
// (curtir, seguir e marcar rotina). Antes de três, não dava para saber o que
// era igual por natureza e o que era coincidência (regra dos três).
//
//   apply()     muda a tela NA HORA e DEVOLVE a função que desfaz a mudança.
//               Ela devolve o undo (em vez de o runOptimistic adivinhar o que
//               desfazer) porque só quem aplicou sabe o estado anterior: o
//               undo "fecha" sobre as variáveis guardadas no apply.
//   request()   devolve a promessa da chamada à API.
//   confirm(d)  recebe o que o servidor devolveu (response.data): o servidor
//               é a fonte da verdade, e aqui se acerta o que ele corrigiu.
//
// No erro: undo(), sem if e sem toast — o toast de erro já foi dado pelo
// interceptor do Axios (um toast aqui o duplicaria).
//
// O QUE MUDA entre os casos: o que apply muda, qual chamada request faz e o
// que confirm acerta. O QUE NÃO MUDA: apply -> request -> confirm | undo.
export async function runOptimistic({ apply, request, confirm }) {
  const undo = apply()
  try {
    const response = await request()
    confirm(response.data)
  } catch {
    undo()
  }
}
