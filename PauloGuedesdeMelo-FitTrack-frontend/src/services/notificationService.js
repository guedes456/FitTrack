import api from './api'
import { PAGE_SIZE } from '../config/constants'

// Minhas notificações, paginadas (a mais nova primeiro).
export function getNotifications(page = 1, limit = PAGE_SIZE) {
  return api.get('/notifications', { params: { page, limit } })
}

// Só o número do sino. Rota própria e leve: é chamada a cada 30 s.
export function getUnreadCount() {
  return api.get('/notifications/unread-count')
}

// Marcar como lida é uma AÇÃO (PATCH): se falhar, o interceptor mostra o toast
// de erro; a tela só desfaz a mudança visual (não duplica o toast).
export function markNotificationAsRead(id) {
  return api.patch(`/notifications/${id}/read`)
}
