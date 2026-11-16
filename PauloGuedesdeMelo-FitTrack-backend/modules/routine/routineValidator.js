const { body, validationResult } = require('express-validator');
const { VALIDATION } = require('../../config/constants');
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

exports.createRoutineValidator = [
  body('title')
    // trim() ANTES de notEmpty() e isLength(): a ordem dos validadores é a
    // ordem em que rodam; "   " (só espaços) vira "" e é recusado, e "ab "
    // conta 2 letras, não 3.
    .trim()
    .notEmpty().withMessage('O título da rotina é obrigatório.')
    .isLength({ min: VALIDATION.ROUTINE_TITLE_MIN, max: VALIDATION.ROUTINE_TITLE_MAX })
    .withMessage(
      `O título deve ter entre ${VALIDATION.ROUTINE_TITLE_MIN} e ${VALIDATION.ROUTINE_TITLE_MAX} caracteres.`
    ),

  // checkFalsy: "" (campo vazio do formulário) conta como "não enviado".
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: VALIDATION.ROUTINE_DESCRIPTION_MAX })
    .withMessage(
      `A descrição deve ter no máximo ${VALIDATION.ROUTINE_DESCRIPTION_MAX} caracteres.`
    ),

  // strict: só os booleanos true/false de verdade. Sem isso, "sim", "1" e
  // "yes" seriam aceitos pelo isBoolean e viraria verdade por acidente.
  body('isPublic')
    .optional()
    .isBoolean({ strict: true }).withMessage('isPublic deve ser true ou false.'),

  validate
];
