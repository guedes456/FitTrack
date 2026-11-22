const { query, body, validationResult } = require('express-validator');
const { ADMIN } = require('../../config/constants');
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

// ?status= é opcional (o controller assume 'pending'); se vier, precisa ser um
// dos três filtros.
exports.reportsFilterValidator = [
  query('status').optional().isIn(ADMIN.REPORT_FILTERS)
    .withMessage('Filtro inválido. Use pending, reviewed ou all.'),
  validate
];

// isBlocked precisa ser um booleano de verdade (true/false do JSON). O
// .exists() + .bail() dá mensagem própria para o campo ausente; o custom
// garante que o TEXTO "true" não passe como se fosse booleano.
exports.blockUserValidator = [
  body('isBlocked')
    .exists().withMessage('Informe isBlocked (true ou false).')
    .bail()
    .isBoolean({ strict: true }).withMessage('isBlocked deve ser true ou false.')
    .bail()
    .custom((value) => typeof value === 'boolean').withMessage('isBlocked deve ser true ou false.'),
  validate
];
