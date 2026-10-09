import api from './api'

export function getMyProfile() {
  return api.get('/profile/me')
}

// Perfil público: com a lista de treinos da pessoa e isOwner. Rota pública na
// API (optionalAuth), então funciona também para visitante anônimo.
export function getPublicProfile(username) {
  return api.get(`/profile/${encodeURIComponent(username)}`)
}

// Única chamada de toda a aplicação que precisa de um Content-Type
// diferente do application/json padrão configurado em api.js. Não
// precisamos mexer na instância do Axios para isso: como formData é uma
// instância de FormData, o próprio Axios detecta isso e substitui o
// Content-Type do header pela versão correta, com o boundary gerado
// automaticamente pelo navegador (um arquivo não cabe, na prática, dentro
// de um corpo JSON — por isso o multipart/form-data existe).
export function updateProfile(formData) {
  return api.put('/profile/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Feed paginado: o cliente pede "página N com L itens"; a API converte isso
// em offset = (page - 1) * limit. O token vai sozinho pelo interceptor do
// api.js — o feed é protegido.
export function getFeed(page = 1, limit = 12) {
  return api.get('/feed', { params: { page, limit } })
}

// Detalhe de um treino. Rota pública na API (optionalAuth): funciona com ou
// sem login, e o token — se existir — vem pelo interceptor, o que permite à
// API devolver isOwner.
export function getWorkoutById(id) {
  return api.get(`/workouts/${id}`)
}

// ---- CRUD do treino (Aula 09) ----

// Treinos do usuário logado, do mais novo para o mais antigo.
export function getMyWorkouts() {
  return api.get('/my-workouts')
}

// Dados para pré-preencher o formulário de edição (só o dono: 403 para os outros).
export function getWorkoutForEdit(id) {
  return api.get(`/workouts/${id}/edit`)
}

// Edição: multipart/form-data porque a imagem nova é opcional mas possível,
// igual ao upload da Aula 07 (o Axios gera o boundary sozinho).
export function updateWorkout(id, formData) {
  return api.put(`/workouts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deleteWorkout(id) {
  return api.delete(`/workouts/${id}`)
}
