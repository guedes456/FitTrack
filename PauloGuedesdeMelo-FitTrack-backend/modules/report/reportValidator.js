const { body, validationResult } = require('express-validator');
const { REPORT } = require('../../config/constants');
const { httpError } = require('../../utils/httpError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const error = httpError(400, errors.array()[0].msg);
  error.errors = errors.array();
  throw error;
};

exports.reportValidator = [
  // isIn com a lista das CHAVES: o rótulo em português ("Spam ou golpes") é do
  // front e aqui é recusado. Primeira defesa; a segunda é o ENUM do banco.
  body('reason').isIn(REPORT.REASONS).withMessage('Escolha um motivo válido para a denúncia.'),
  validate
];
