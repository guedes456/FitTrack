import api from './api'

// Minhas rotinas (da pessoa logada), da mais nova para a mais antiga.
export function getMyRoutines() {
  return api.get('/my-routines')
}

// Criar é um FORMULÁRIO (o modal mostra o erro dentro dele): silent: true
// no TERCEIRO argumento do post(url, data, config), que é onde o config mora.
export function createRoutine(payload) {
  return api.post('/routines', payload, { silent: true })
}

// Rota pública: visitante lê rotina pública; a dona lê a privada dela.
export function getRoutineById(id) {
  return api.get(`/routines/${id}`)
}

// delete(url, config): o config é o SEGUNDO argumento (aqui não precisa).
export function deleteRoutine(id) {
  return api.delete(`/routines/${id}`)
}

// Adicionar: o id do TREINO vai no CORPO.
export function addWorkoutToRoutine(routineId, workoutId) {
  return api.post(`/routines/${routineId}/workouts`, { workoutId })
}

// Remover: o id do TREINO vai na URL (DELETE não costuma levar corpo).
export function removeWorkoutFromRoutine(routineId, workoutId) {
  return api.delete(`/routines/${routineId}/workouts/${workoutId}`)
}

// Alimenta o modal "Salvar": as minhas rotinas + hasWorkout para este treino.
export function getRoutinesStatus(workoutId) {
  return api.get(`/workouts/${workoutId}/routines-status`)
}
