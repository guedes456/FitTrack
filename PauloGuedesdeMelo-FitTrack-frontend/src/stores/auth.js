import { defineStore } from 'pinia'
import { login as loginRequest, logout as logoutRequest } from '../services/authService'

// Estas duas chaves também são lidas diretamente (sem passar pela store)
// dentro do interceptor de requisição do Axios (services/api.js). É
// proposital: se api.js importasse esta store, e esta store importa
// authService.js, que importa api.js de volta, teríamos uma dependência
// circular entre os arquivos. Ler localStorage direto quebra esse ciclo.
export const TOKEN_KEY = 'fittrack_token'
export const USER_KEY = 'fittrack_user'

function loadStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: loadStoredUser(),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => !!state.user?.isAdmin,
  },

  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },

    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },

    async login(credentials) {
      const response = await loginRequest(credentials)
      this.setSession(response.data.token, response.data.user)
      return response
    },

    async logout() {
      try {
        await logoutRequest()
      } catch {
        // Mesmo se a chamada à API falhar (rede fora do ar, token já
        // inválido etc.), a sessão local é sempre encerrada.
      } finally {
        this.clearSession()
      }
    },
  },
})
