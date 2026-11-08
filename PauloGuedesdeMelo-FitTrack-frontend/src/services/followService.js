import api from './api'

// Seguir / deixar de seguir (toggle). Exige login: o token vai pelo
// interceptor do api.js. Resposta: { isFollowing, followersCount } já com o
// valor confirmado no banco.
export function toggleFollow(userId) {
  return api.post(`/users/${userId}/toggle-follow`)
}

// Listas públicas. A API usa o ID do usuário (não o username).
export function getFollowers(userId) {
  return api.get(`/users/${userId}/followers`)
}

export function getFollowing(userId) {
  return api.get(`/users/${userId}/following`)
}

// Feed só com os treinos de quem eu sigo (paginado, como o Feed Geral).
export function getFollowingWorkouts(page = 1, limit = 12) {
  return api.get('/following-workouts', { params: { page, limit } })
}
