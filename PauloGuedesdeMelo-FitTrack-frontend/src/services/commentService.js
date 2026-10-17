import api from './api'

// Leitura pública: qualquer visitante vê os comentários (mais novos primeiro).
export function getComments(workoutId) {
  return api.get(`/workouts/${workoutId}/comments`)
}

// Exige login. Devolve o comentário criado já com o autor, para a tela
// mostrá-lo na hora sem recarregar a lista.
export function addComment(workoutId, content) {
  return api.post(`/workouts/${workoutId}/comments`, { content })
}
