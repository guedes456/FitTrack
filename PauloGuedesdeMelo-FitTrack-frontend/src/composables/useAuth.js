import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getProfilePictureUrl } from '../utils/media'

/**
 * useAuth() centraliza o ACESSO ao estado de autenticação para os
 * componentes (guarda de rota, Navbar, Sidebar, telas). Ele não guarda
 * estado próprio — quem guarda o estado (token, user) continua sendo a
 * store do Pinia (stores/auth.js). O composable é só uma camada fina por
 * cima dela, com valores já prontos pra usar em template (computed) e
 * nomes mais descritivos para quem consome, sem cada componente precisar
 * conhecer o formato interno da store.
 *
 * Diferença prática pra um componente (ex.: BaseInput):
 * - Um componente tem template próprio e aparece na árvore de elementos.
 * - Um composable é só uma função que devolve estado/lógica reativa para
 *   ser usada dentro de outros componentes ou até fora deles (como aqui,
 *   dentro do router guard) — não renderiza nada sozinho.
 */
export function useAuth() {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const username = computed(() => authStore.user?.username || '')
  const profilePictureUrl = computed(() =>
    getProfilePictureUrl(authStore.user?.profilePicture)
  )

  async function login(credentials) {
    return authStore.login(credentials)
  }

  async function logout() {
    return authStore.logout()
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    username,
    profilePictureUrl,
    login,
    logout,
  }
}
