// A API guarda no banco só o NOME do arquivo (ex: "user-3-172839.png" ou o
// "default-profile.png"), nunca a URL completa — quem monta a URL pública é
// o front, porque só ele sabe se está rodando em localhost, num domínio de
// homologação, etc. Este arquivo centraliza essa montagem num só lugar.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Recebe o nome de arquivo salvo em profilePicture e devolve a URL
 * completa e pública para exibir a imagem (servida pelo express.static
 * da API, em /uploads/profiles/<arquivo>).
 */
export function getProfilePictureUrl(fileName) {
  if (!fileName) {
    fileName = 'default-profile.png'
  }
  return `${API_BASE_URL}/uploads/profiles/${fileName}`
}

/**
 * URL pública da imagem de um treino (Grupo B: a imagem é o próprio
 * conteúdo, então a mesma URL serve para a miniatura do card no Feed e para
 * a imagem em resolução real no Detalhe — quem muda é só o CSS).
 *
 * Aponta para o caminho ESTÁTICO (/uploads/workouts/...), e não para uma rota
 * da API: uma tag <img> não consegue enviar o header Authorization, então
 * ela só consegue carregar URLs que não exigem token.
 */
export function getWorkoutImageUrl(fileName) {
  return `${API_BASE_URL}/uploads/workouts/${fileName}`
}
