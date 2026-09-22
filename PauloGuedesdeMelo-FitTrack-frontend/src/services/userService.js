import api from './api'

export function getMyProfile() {
  return api.get('/profile/me')
}

export function getPublicProfile(username) {
  return api.get(`/profile/${username}`)
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
