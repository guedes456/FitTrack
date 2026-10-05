const { error } = require('./apiResponse');

module.exports = (err, req, res, next) => {
  console.error(err);

  // Erros do próprio Multer (ex.: arquivo acima do limite) não trazem
  // `status`; sem este tratamento cairiam como 500, mas são erro do cliente.
  if (err.name === 'MulterError') {
    err.status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      err.message = 'Arquivo muito grande. Envie uma imagem de até 8MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      err.message = 'Campo de arquivo inesperado.';
    }
  }

  const statusCode = err.status || 500;
  const errors = err.errors || [];

  return error(res, err.message || 'Ocorreu um erro inesperado.', statusCode, errors);
};
