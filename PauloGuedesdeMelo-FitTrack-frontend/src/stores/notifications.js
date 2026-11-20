import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUnreadCount } from '../services/notificationService'
import { NOTIFICATIONS } from '../config/constants'

// Número de notificações NÃO LIDAS (o selo do sino) + o POLLING que o mantém
// atualizado. Estilo "setup": as variáveis do escopo são o estado e as
// funções, as ações; o que não é devolvido (timerId, lastRefreshId) é privado.
export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)

  // Cada refresh leva um número de chamada; só o MAIS RECENTE pode escrever.
  // A história da corrida: o polling pergunta (resposta demora, "5"); no
  // meio-tempo o usuário marca uma notificação como lida (sino vai para "4");
  // a resposta velha chega e sobrescreve o 4 com o 5 — o sino "volta". O
  // número de chamada descarta essa resposta antiga.
  let lastRefreshId = 0
  let timerId = null

  async function refresh() {
    const myId = ++lastRefreshId
    try {
      const response = await getUnreadCount()
      if (myId !== lastRefreshId) return
      unreadCount.value = response.data.unreadCount
    } catch {
      // Polling é SILENCIOSO: uma falha (rede, API fora) não vira erro na
      // tela; a próxima rodada tenta de novo.
    }
  }

  // Quem altera o número "na mão" (marcar como lida, e o undo) usa ESTA função,
  // e não unreadCount.value direto: ela também sobe o lastRefreshId, o que
  // invalida qualquer refresh que já saiu e ainda não respondeu. Sem isso, a
  // resposta velha do polling passaria por cima do número novo.
  function setUnreadCount(value) {
    lastRefreshId++
    unreadCount.value = value
  }

  // Aba escondida não pergunta: ninguém está olhando o sino, e perguntar a cada
  // 30 s com a aba em segundo plano só gasta bateria e requisições.
  function refreshIfVisible() {
    if (document.visibilityState === 'visible') refresh()
  }

  function startPolling() {
    // Já ligado: não cria um SEGUNDO temporizador (login, logout e login de
    // novo, ou o watch disparando duas vezes, empilhariam intervalos e
    // multiplicariam as requisições).
    if (timerId !== null) return
    refresh()
    timerId = setInterval(refreshIfVisible, NOTIFICATIONS.POLL_MS)
    // Ao VOLTAR para a aba, pergunta na hora (não espera até 30 s).
    document.addEventListener('visibilitychange', refreshIfVisible)
  }

  function stopPolling() {
    clearInterval(timerId)
    timerId = null
    // A MESMA referência (refreshIfVisible) do addEventListener: com uma
    // função nova, o removeEventListener não removeria nada.
    document.removeEventListener('visibilitychange', refreshIfVisible)
    // Invalida um refresh em andamento (a resposta não pode ressuscitar o
    // número depois do logout) e zera o selo.
    lastRefreshId++
    unreadCount.value = 0
  }

  return { unreadCount, refresh, setUnreadCount, refreshIfVisible, startPolling, stopPolling }
})
