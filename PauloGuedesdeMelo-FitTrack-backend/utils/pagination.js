// Converte o texto da query string num inteiro dentro de [min, max]; qualquer
// valor ausente ou inválido (ex.: ?page=abc) cai no padrão, em vez de virar erro.
function parseIntInRange(value, fallback, min, max) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

module.exports = { parseIntInRange };
