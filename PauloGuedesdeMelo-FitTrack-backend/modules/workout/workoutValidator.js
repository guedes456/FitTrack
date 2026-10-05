const { body, validationResult } = require('express-validator');
const fs = require('fs');
const { VALIDATION } = require('../../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  // O Multer já gravou o arquivo antes do validator rodar; se a requisição
  // for recusada, apaga o arquivo para não deixar lixo em uploads/workouts.
  if (req.file) {
    fs.unlink(req.file.path, () => {});
  }
  const firstError = errors.array()[0].msg;
  const error = new Error(firstError);
  error.status = 400;
  error.errors = errors.array();
  throw error;
};

// Grupo B: a imagem é obrigatória (é o próprio conteúdo do treino, não uma
// capa opcional). O express-validator não enxerga req.file — só req.body —
// então essa checagem é feita à mão, na mesma posição em que um
// body(...).notEmpty() ficaria.
function requireImage(req, res, next) {
  if (!req.file) {
    const error = new Error('A imagem do treino é obrigatória.');
    error.status = 400;
    error.errors = [{ msg: error.message, path: 'image' }];
    return next(error);
  }
  return next();
}

exports.createWorkoutValidator = [
  requireImage,

  body('title')
    .notEmpty().withMessage('O título é obrigatório.')
    .isLength({ max: VALIDATION.TITLE_MAX })
    .withMessage(`O título deve ter no máximo ${VALIDATION.TITLE_MAX} caracteres.`)
    .trim(),

  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: VALIDATION.DESCRIPTION_MAX })
    .withMessage(`A descrição deve ter no máximo ${VALIDATION.DESCRIPTION_MAX} caracteres.`)
    .trim(),

  validate
];
