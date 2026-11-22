const { verifyToken } = require('../config/jwt');
const User = require('../modules/user/userModel');
const { httpError } = require('../utils/httpError');

const BLOCKED_MESSAGE = 'Sua conta foi bloqueada. Entre em contato com a administração.';

/**
 * Protege rotas que exigem usuário autenticado.
 * Espera o header:  Authorization: Bearer <token>
 *
 * Desde a Aula 15 o middleware é ASSÍNCRONO e CONSULTA O BANCO a cada
 * requisição, em vez de confiar no que está dentro do token:
 *  - Sem header ou header mal formado            -> 401
 *  - Token inválido/expirado                     -> 401
 *  - Usuário do token não existe mais (apagado)  -> 401
 *  - Usuário bloqueado                           -> 401 (mensagem do bloqueio)
 *  - Tudo certo -> req.user = { id, username, isAdmin } montado a partir do
 *    BANCO. Um administrador rebaixado perde o poder na hora, um bloqueado
 *    perde o acesso na hora, mesmo com o token antigo ainda "dentro da validade".
 *
 * Custo: uma consulta por chave primária (barata) em toda rota autenticada.
 * Alternativas: token curto + refresh token, ou lista de tokens revogados.
 */
async function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(httpError(401, 'Não autorizado. Token não informado.'));
  }

  const token = authHeader.split(' ')[1];

  // (a) try/catch SÓ da verificação do token: aqui, erro = token ruim = 401.
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return next(httpError(401, 'Não autorizado. Token inválido ou expirado.'));
  }

  // (f) segundo try/catch, para a consulta: erro aqui NÃO é culpa do token
  // (banco fora do ar...), então vai para o errorHandler como 500.
  try {
    // (b) só os campos necessários; nunca a senha.
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'isAdmin', 'isBlocked']
    });

    // (c) conta apagada depois de emitido o token.
    if (!user) {
      return next(httpError(401, 'Não autorizado. Token inválido ou expirado.'));
    }

    // (d) conta bloqueada.
    if (user.isBlocked) {
      return next(httpError(401, BLOCKED_MESSAGE));
    }

    // (e) o papel vem do BANCO, nunca do token.
    req.user = { id: user.id, username: user.username, isAdmin: Boolean(user.isAdmin) };
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Autorização por papel. Precisa vir DEPOIS do isAuthenticated: é ele que
 * monta o req.user. Se viesse antes, req.user seria indefinido e todos
 * (até o administrador) receberiam 403.
 */
function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return next(httpError(403, 'Acesso restrito a administradores.'));
  }
  return next();
}

// O export padrão continua sendo o isAuthenticated: todas as rotas antigas
// fazem require('../../middlewares/auth') e seguem funcionando sem alteração.
module.exports = isAuthenticated;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isAdmin = isAdmin;
module.exports.BLOCKED_MESSAGE = BLOCKED_MESSAGE;
