import api from './api'

// Denunciar é um FORMULÁRIO (o modal mostra o erro dentro dele): silent: true
// no TERCEIRO argumento do post(url, data, config), onde o config mora.
export function reportWorkout(workoutId, reason) {
  return api.post(`/workouts/${workoutId}/report`, { reason }, { silent: true })
}
