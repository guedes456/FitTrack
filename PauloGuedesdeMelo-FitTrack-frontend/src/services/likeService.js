import api from './api'

// Curtir/descurtir (toggle). Exige login: o token vai pelo interceptor do
// api.js. Resposta: { liked, likesCount } já com o valor confirmado no banco.
export function toggleLike(workoutId) {
  return api.post(`/workouts/${workoutId}/toggle-like`)
}

// Rota pública: visitante recebe liked: false; logado, o valor real.
export function getLikeStatus(workoutId) {
  return api.get(`/workouts/${workoutId}/like-status`)
}

// Treinos que o usuário logado curtiu (cada um com o autor).
export function getLikedWorkouts() {
  return api.get('/liked-workouts')
}
