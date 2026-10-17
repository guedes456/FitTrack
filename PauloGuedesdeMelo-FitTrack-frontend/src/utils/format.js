// Formatadores de exibição usados em várias telas e componentes, para que
// datas e números apareçam do mesmo jeito em todo o app.

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('pt-BR')
}

export function formatDateTime(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

// 950 -> "950", 1200 -> "1,2 mil": contadores grandes não estouram o card.
export function formatCount(value) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(value ?? 0)
}
