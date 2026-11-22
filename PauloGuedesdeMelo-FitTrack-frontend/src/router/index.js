import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

const routes = [
  { path: '/', name: 'landing', component: () => import('../views/LandingView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/auth/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/auth/RegisterView.vue') },

  { path: '/feed', name: 'feed', component: () => import('../views/FeedView.vue'), meta: { requiresAuth: true } },
  { path: '/feed/seguindo', name: 'feed-following', component: () => import('../views/FeedFollowingView.vue'), meta: { requiresAuth: true } },
  { path: '/treinos/:id', name: 'treino-detail', component: () => import('../views/TreinoDetailView.vue') },
  { path: '/treinos/:id/editar', name: 'workout-edit', component: () => import('../views/EditWorkoutView.vue'), meta: { requiresAuth: true } },
  { path: '/curtidos', name: 'liked-workouts', component: () => import('../views/LikedWorkoutsView.vue'), meta: { requiresAuth: true } },
  { path: '/meus-treinos', name: 'my-workouts', component: () => import('../views/MyWorkoutsView.vue'), meta: { requiresAuth: true } },
  // Rotinas (Aula 13). A lista é só para quem está logado; o DETALHE é público
  // (sem requiresAuth): o link de uma rotina pública abre para qualquer pessoa,
  // e a API decide se mostra (200) ou responde 403 (privada) / 404.
  { path: '/minhas-rotinas', name: 'my-routines', component: () => import('../views/MyRoutinesView.vue'), meta: { requiresAuth: true } },
  { path: '/rotinas/:id', name: 'routine-detail', component: () => import('../views/RoutineDetailView.vue') },
  { path: '/sugestoes', name: 'suggestions', component: () => import('../views/SuggestionsView.vue'), meta: { requiresAuth: true } },
  { path: '/upload', name: 'upload', component: () => import('../views/UploadView.vue'), meta: { requiresAuth: true } },
  { path: '/meu-progresso', name: 'my-progress', component: () => import('../views/MyProgressView.vue'), meta: { requiresAuth: true } },

  { path: '/busca', name: 'search', component: () => import('../views/SearchView.vue') },
  { path: '/notificacoes', name: 'notifications', component: () => import('../views/NotificationsView.vue'), meta: { requiresAuth: true } },

  { path: '/perfil', name: 'my-profile', component: () => import('../views/profile/MyProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/profile/:username', name: 'public-profile', component: () => import('../views/profile/PublicProfileView.vue') },
  // Uma tela só para as duas listas: o que muda é a prop `kind`, definida aqui na rota.
  { path: '/profile/:username/followers', name: 'followers', component: () => import('../views/profile/FollowListView.vue'), props: { kind: 'followers' } },
  { path: '/profile/:username/following', name: 'following', component: () => import('../views/profile/FollowListView.vue'), props: { kind: 'following' } },

  // Painel de administração (Aula 15): UMA rota pai com o layout e as quatro
  // telas como filhas. `meta` fica só no pai: o `to.meta` de uma rota filha
  // MESCLA a meta dos pais, então a guarda enxerga requiresAdmin nas quatro.
  // Os caminhos dos filhos são RELATIVOS (sem barra inicial); com barra, o
  // Vue Router os trataria como absolutos e fugiria do /admin. O `redirect`
  // faz o link /admin da barra lateral abrir o Dashboard.
  {
    path: '/admin',
    component: () => import('../components/layout/AdminLayout.vue'),
    redirect: { name: 'admin-dashboard' },
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboardView.vue') },
      { path: 'denuncias', name: 'admin-reports', component: () => import('../views/admin/AdminReportsView.vue') },
      { path: 'usuarios', name: 'admin-users', component: () => import('../views/admin/AdminUsersView.vue') },
      { path: 'treinos', name: 'admin-treinos', component: () => import('../views/admin/AdminTreinosView.vue') },
    ],
  },

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

  // Guarda por PAPEL (depois da de login). ATENÇÃO: isto é só conforto de
  // navegação. O `isAdmin` vem do localStorage, que o usuário edita no
  // Console; quem protege os dados de verdade é a API (401/403 em /api/admin).
  if (to.meta.requiresAdmin && !isAdmin.value) {
    useToast().error('Você não tem permissão para acessar a administração.')
    return { name: 'feed' }
  }

  return true
})

export default router
