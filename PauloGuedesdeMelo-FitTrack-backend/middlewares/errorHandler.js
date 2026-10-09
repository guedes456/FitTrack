const fs = require('fs');
const { error } = require('./apiResponse');

/**
 * Apaga do disco os arquivos que o Multer já gravou numa requisição que
 * acabou em erro. O Multer roda ANTES da validação e da checagem de dono,
 * então, quando a requisição é recusada (400, 403, 404...), o arquivo já
 * está em disco sem nenhum registro no banco apontando para ele: um
 * arquivo órfão. Como TODO erro das rotas passa por este handler, é aqui,
 * num lugar só, que a limpeza acontece — cobre upload de treino, edição e
 * foto de perfil sem repetir código em cada validator/service.
 */
function removeOrphanUploads(req) {
  const uploaded = [];

  if (req.file) uploaded.push(req.file);

  if (Array.isArray(req.files)) {
    uploaded.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((list) => uploaded.push(...list));
  }

  uploaded.forEach((file) => {
    if (!file.path) return;
    fs.unlink(file.path, (err) => {
      // ENOENT = o arquivo já não existe (outro ponto já limpou): tudo bem.
      if (err && err.code !== 'ENOENT') {
        console.error('Não foi possível remover arquivo órfão:', err.message);
      }
    });
  });
}

module.exports = (err, req, res, next) => {
  console.error(err);

  removeOrphanUploads(req);

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
