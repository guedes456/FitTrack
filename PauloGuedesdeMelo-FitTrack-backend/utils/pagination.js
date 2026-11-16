const { PAGINATION } = require('../config/constants');

// Converte o texto da query string num inteiro >= 1. Qualquer coisa que não
// seja um inteiro positivo ("abc", "-3", "0", vazio) devolve o padrão:
// parseInt('abc') é NaN e NaN >= 1 é false, então o mesmo teste cobre os
// dois casos (não-número e número fora da faixa) sem tratar NaN à parte.
function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return parsed >= 1 ? parsed : fallback;
}

// Lê ?page= e ?limit= dos feeds. O limit tem TETO (MAX_LIMIT): sem ele,
// ?limit=100000 faria o banco devolver a tabela inteira numa resposta só.
// Atenção: é `>= 1`, e não `> 1` — com `> 1`, ?limit=1 cairia no padrão (12).
function parsePagination(query) {
  const page = parsePositiveInt(query.page, PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    parsePositiveInt(query.limit, PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  return { page, limit };
}

module.exports = { parsePositiveInt, parsePagination };
