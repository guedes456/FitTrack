import api from './api'

// onUploadProgress é passado pela VIEW (não fixado aqui), porque só o
// componente sabe o que fazer com o progresso (atualizar uma barra, um
// texto, etc.) — o service só repassa a opção pro Axios.
export function createWorkout(formData, onUploadProgress) {
  return api.post('/workouts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
}
