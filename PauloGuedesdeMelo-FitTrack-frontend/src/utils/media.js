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
