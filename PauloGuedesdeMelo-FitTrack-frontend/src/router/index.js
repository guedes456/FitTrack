import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  { path: '/', name: 'landing', component: () => import('../views/LandingView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/auth/RegisterView.vue') },

  { path: '/feed', name: 'feed', component: () => import('../views/FeedView.vue') },
  { path: '/feed/seguindo', name: 'feed-following', component: () => import('../views/FeedFollowingView.vue'), meta: { requiresAuth: true } },
  { path: '/treinos/:id', name: 'treino-detail', component: () => import('../views/TreinoDetailView.vue') },
  { path: '/sugestoes', name: 'suggestions', component: () => import('../views/SuggestionsView.vue'), meta: { requiresAuth: true } },
  { path: '/upload', name: 'upload', component: () => import('../views/UploadView.vue'), meta: { requiresAuth: true } },
  { path: '/meu-progresso', name: 'my-progress', component: () => import('../views/MyProgressView.vue'), meta: { requiresAuth: true } },

  { path: '/busca', name: 'search', component: () => import('../views/SearchView.vue') },
  { path: '/notificacoes', name: 'notifications', component: () => import('../views/NotificationsView.vue'), meta: { requiresAuth: true } },

  { path: '/perfil', name: 'my-profile', component: () => import('../views/profile/MyProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/usuarios/:id', name: 'public-profile', component: () => import('../views/profile/PublicProfileView.vue') },

  { path: '/admin', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboardView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/usuarios', name: 'admin-users', component: () => import('../views/admin/AdminUsersView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/treinos', name: 'admin-treinos', component: () => import('../views/admin/AdminTreinosView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/categorias', name: 'admin-categorias', component: () => import('../views/admin/AdminCategoriesView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  // useAuth() é chamado aqui dentro, nunca no topo do arquivo: no topo,
  // o Pinia ainda não foi registrado pelo app (main.js) e a chamada quebraria.
  const { isAuthenticated, isAdmin } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { name: 'landing' }
  }

  return true
})

export default router
