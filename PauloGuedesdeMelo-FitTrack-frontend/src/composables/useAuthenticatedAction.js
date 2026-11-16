import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './useAuth'

// Cerca comum dos botões de ação social (curtir, seguir):
//  1) visitante não chama a API (daria 401): vai ao login e volta depois;
//  2) clique durante uma requisição em andamento é ignorado (isBusy) —
//     três cliques rápidos geram UMA requisição.
// O MIOLO da atualização otimista (guardar o estado anterior, mudar a tela,
// confirmar com o servidor) fica em cada botão: só existem dois e eles
// diferem (LikeButton tem estado próprio; FollowButton usa defineModel).
// Só extraímos um padrão ao ver a terceira repetição (regra dos três).
//
// Quem avisa o usuário do erro é o interceptor (toast); a `action` só
// precisa desfazer a mudança visual no catch.
export function useAuthenticatedAction(action) {
  const route = useRoute()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const isBusy = ref(false)

  async function run(...args) {
    if (!isAuthenticated.value) {
      router.push({ name: 'login', query: { redirect: route.fullPath } })
      return
    }
    if (isBusy.value) return

    isBusy.value = true
    try {
      await action(...args)
    } finally {
      isBusy.value = false
    }
  }

  return { run, isBusy }
}
