// Helpers pequenos para os services lançarem erros HTTP sem repetir
// `new Error` + `error.status` em todo lugar. Quem converte o erro em
// resposta é o errorHandler.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Converte o :id da URL em inteiro positivo; qualquer outra coisa
// ("abc", "0", "-3", "1.5") vira 404, como um id que não existe.
function parseId(value, message = 'Treino não encontrado.') {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw httpError(404, message);
  }
  return id;
}

module.exports = { httpError, parseId };
