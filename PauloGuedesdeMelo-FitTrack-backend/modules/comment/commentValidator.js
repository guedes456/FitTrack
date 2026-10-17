const { body, validationResult } = require('express-validator');
const { VALIDATION } = require('../../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const error = new Error(errors.array()[0].msg);
  error.status = 400;
  error.errors = errors.array();
  throw error;
};

exports.createCommentValidator = [
  body('content')
    // trim() ANTES de notEmpty(): a ordem dos validadores é a ordem em que
    // eles rodam. Se notEmpty() viesse primeiro, "     " (só espaços) passaria
    // — não está vazio — e só depois o trim() o transformaria em "".
    .trim()
    .notEmpty().withMessage('O comentário não pode ficar vazio.')
    .isLength({ max: VALIDATION.COMMENT_MAX })
    .withMessage(`O comentário deve ter no máximo ${VALIDATION.COMMENT_MAX} caracteres.`),

  validate
];
