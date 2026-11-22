import api from './api'
import { PAGE_SIZE } from '../config/constants'

// Painel de administração (Aula 15). SEM { silent: true } em nenhuma chamada:
// aqui não há formulário que mostre o erro ao lado do campo. As LEITURAS (GET)
// mostram o erro no lugar do conteúdo (a tela); as AÇÕES (PATCH/DELETE) têm o
// toast de erro do interceptor. Por isso as telas só chamam toast.success.

// Cartões do Dashboard: { users, blockedUsers, workouts, comments, likes,
// pendingReports, reviewedReports }.
export function getAdminDashboard() {
  return api.get('/admin/dashboard')
}

// status: 'pending' | 'reviewed' | 'all'.
export function getAdminReports(status = 'pending', page = 1, limit = PAGE_SIZE) {
  return api.get('/admin/reports', { params: { status, page, limit } })
}

// patch SEM segundo argumento (nunca `null`): o Axios enviaria o corpo "null"
// com Content-Type JSON e o express.json() o recusaria (400 de parse).
export function reviewAdminReport(id) {
  return api.patch(`/admin/reports/${id}/review`)
}

export function getAdminUsers(search = '', page = 1, limit = PAGE_SIZE) {
  return api.get('/admin/users', { params: { search, page, limit } })
}

export function setUserBlocked(id, isBlocked) {
  return api.patch(`/admin/users/${id}/block`, { isBlocked })
}

export function getAdminWorkouts(search = '', page = 1, limit = PAGE_SIZE) {
  return api.get('/admin/workouts', { params: { search, page, limit } })
}

export function deleteAdminWorkout(id) {
  return api.delete(`/admin/workouts/${id}`)
}
