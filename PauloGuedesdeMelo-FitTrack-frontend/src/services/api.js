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

// Chaves duplicadas aqui de propósito (batem com stores/auth.js). Este
// arquivo NÃO importa a store: se importasse, teríamos um ciclo
// api.js -> stores/auth.js -> services/authService.js -> api.js.
// Ler o token direto do localStorage evita essa dependência circular.
const TOKEN_KEY = 'fittrack_token'
const USER_KEY = 'fittrack_user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de requisição: anexa o token, se existir, em toda chamada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const apiError = error.response.data

      if (error.response.status === 401) {
        // Sessão inválida ou expirada: limpamos tudo e mandamos o usuário
        // de volta ao Login, preservando para onde ele queria ir.
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)

        const currentPath = window.location.pathname + window.location.search
        if (!currentPath.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
        }
      }

      return Promise.reject({
        message: apiError.message || 'Ocorreu um erro na requisição.',
        errors: apiError.errors || [],
        status: error.response.status,
      })
    } else if (error.request) {
      return Promise.reject({
        message: 'Não foi possível se conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.',
        errors: [],
        status: null,
      })
    } else {
      return Promise.reject({
        message: 'Erro inesperado ao preparar a requisição.',
        errors: [],
        status: null,
      })
    }
  }
)

export default api
