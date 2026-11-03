import api from './api'

// Seguir/deixar de seguir (toggle). Exige login: o token vai pelo interceptor
// do api.js. Resposta: { isFollowing, followersCount } já confirmados no banco.
export function toggleFollow(userId) {
  return api.post(`/users/${userId}/toggle-follow`)
}

// Listas públicas. Recebem o ID do usuário (a API usa id; as rotas do front
// usam username — por isso a tela primeiro busca o perfil).
export function getFollowers(userId) {
  return api.get(`/users/${userId}/followers`)
}

export function getFollowing(userId) {
  return api.get(`/users/${userId}/following`)
}

// Feed só com os treinos de quem o usuário logado segue (paginado, como o
// feed geral): { items, page, limit, total, hasMore }.
export function getFollowingWorkouts(page = 1, limit = 12) {
  return api.get('/following-workouts', { params: { page, limit } })
}
