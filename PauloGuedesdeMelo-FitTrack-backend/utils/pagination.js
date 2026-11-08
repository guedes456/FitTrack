const { PAGINATION } = require('../config/constants');

// Converte o texto da query string num inteiro dentro de [min, max]; valor
// ausente ou inválido (ex.: ?page=abc) cai no padrão em vez de virar erro.
function parseIntInRange(value, fallback, min, max) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

// Lê ?page= e ?limit= (padrões 1 e 12; limit no máximo 50).
function parsePagination(query) {
  return {
    page: parseIntInRange(query.page, PAGINATION.DEFAULT_PAGE, 1, Number.MAX_SAFE_INTEGER),
    limit: parseIntInRange(query.limit, PAGINATION.DEFAULT_LIMIT, 1, PAGINATION.MAX_LIMIT)
  };
}

module.exports = { parseIntInRange, parsePagination };
