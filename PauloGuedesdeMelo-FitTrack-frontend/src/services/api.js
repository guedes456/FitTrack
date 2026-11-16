// Instância única do Axios usada por todo o front-end, com um interceptor
// de resposta que padroniza qualquer erro (validação, autenticação ou rede)
// no mesmo formato { message, errors, status }.
//
// - Sucesso: response.data "descasca" um nível, então cada chamada feita
//   através de `api` já recebe direto o envelope { success, message, data }
//   da nossa API, sem precisar escrever response.data toda vez.
// - error.response: a API respondeu, mas com status de erro (400, 401, 404...).
//   Reaproveitamos o { message, errors } que o próprio apiResponse.js da API
//   já formatou.
// - error.request: a requisição foi enviada, mas nenhuma resposta chegou
//   (API fora do ar, sem internet). Não existe error.response.data pra ler,
//   por isso devolvemos uma mensagem genérica e amigável.
// - else: erro raro, na própria montagem da requisição (ex: config inválida).
//
// Em qualquer um dos três casos o resultado final é sempre um Promise.reject
// no mesmo formato — é isso que tira das telas a responsabilidade de tratar
// erro cada uma do seu jeito.

import axios from 'axios'
import { STORAGE_KEYS, MESSAGES } from '../config/constants'
import { useToast } from '../composables/useToast'

// Este arquivo NÃO importa a store de auth (ciclo api.js -> stores/auth.js ->
// authService.js -> api.js): lê o token direto do localStorage, usando as
// chaves compartilhadas de config/constants.js.

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de requisição: anexa o token, se existir, em toda chamada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// QUEM AVISA O USUÁRIO quando algo falha:
//  - AÇÃO (POST/PUT/DELETE) que falha -> toast, aqui, salvo `silent: true`
//    (formulários mostram o erro ao lado do campo; toast seria duplicado);
//  - LEITURA (GET) que falha -> é da TELA, que mostra o erro no lugar do
//    conteúdo. Toast para toda leitura encheria a tela de avisos;
//  - 401 -> o usuário é levado ao login (sem toast: a tela já vai mudar).
// "Toast para todo erro" seria erro de design: o mesmo problema seria
// avisado duas vezes (toast + tela/formulário).
function notifyIfNeeded(error, config) {
  const isAction = (config?.method || 'get').toLowerCase() !== 'get'
  if (!isAction || config?.silent || error.status === 401) return
  useToast().error(error.message)
}

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let apiError

    if (error.response) {
      const data = error.response.data || {}

      if (error.response.status === 401) {
        // Sessão inválida ou expirada: limpamos tudo e mandamos o usuário
        // de volta ao Login, preservando para onde ele queria ir.
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)

        const currentPath = window.location.pathname + window.location.search
        if (!currentPath.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
        }
      }

      apiError = {
        message: data.message || MESSAGES.GENERIC_ERROR,
        errors: data.errors || [],
        status: error.response.status,
      }
    } else if (error.request) {
      // Requisição enviada, nenhuma resposta (API fora do ar, Offline).
      apiError = { message: MESSAGES.NETWORK_ERROR, errors: [], status: null }
    } else {
      apiError = { message: MESSAGES.REQUEST_SETUP_ERROR, errors: [], status: null }
    }

    notifyIfNeeded(apiError, error.config)
    return Promise.reject(apiError)
  }
)

export default api
