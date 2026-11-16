const searchService = require('./searchService');
const { success } = require('../../middlewares/apiResponse');
const { SEARCH } = require('../../config/constants');

// GET /api/search?q=...
exports.search = async (req, res) => {
  // req.query.q pode NÃO ser texto: ?q=ab&q=cd vira um array e ?q[x]=1 vira
  // um objeto. Chamar .trim() num deles quebraria com 500; por isso o typeof.
  const raw = typeof req.query.q === 'string' ? req.query.q : '';
  const query = raw.trim().slice(0, SEARCH.MAX_LENGTH);

  let results = { treinos: [], users: [] };

  // Termo curto demais não consulta o banco (1 letra devolveria quase tudo).
  if (query.length >= SEARCH.MIN_LENGTH) {
    // await: sem ele, `results` seria uma Promise e o ...results espalharia
    // nada — a resposta sairia 200 com o `query`, mas SEM as listas.
    results = await searchService.globalSearch(query);
  }

  return success(res, { query, ...results });
};
