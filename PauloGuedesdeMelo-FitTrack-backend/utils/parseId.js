const { httpError } = require('./httpError');

// Converte um identificador que chegou como TEXTO (req.params, req.body) em
// inteiro positivo; qualquer outra coisa ("abc", "0", "-3", "1.5", "", true,
// [1], {}) vira 400. Fica na BORDA (controller): o service só recebe números.
//
// Diferença para parseId de utils/httpError.js: aquele trata o id inválido
// como "não existe" (404) no módulo de treinos; este diz que o PEDIDO está
// malformado (400), que é a ordem 400 -> 404 -> 403 das rotas de escrita.
function parseId(rawValue, label) {
  const isText = typeof rawValue === 'string';
  const isNumber = typeof rawValue === 'number';
  const valid =
    (isText && /^[0-9]+$/.test(rawValue)) || (isNumber && Number.isInteger(rawValue));
  const id = valid ? Number(rawValue) : NaN;

  if (!Number.isSafeInteger(id) || id < 1) {
    throw httpError(400, `Identificador de ${label} inválido.`);
  }
  return id;
}

module.exports = { parseId };
