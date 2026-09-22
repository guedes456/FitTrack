const { verifyToken } = require('../config/jwt');

/**
 * Protege rotas que exigem usuário autenticado.
 * Espera o header:  Authorization: Bearer <token>
 *
 * - Sem header ou header mal formado -> 401
 * - Token presente mas inválido/expirado -> 401
 * - Token válido -> req.user recebe o payload decodificado ({ id, username, isAdmin })
 *   e a rota protegida segue normalmente.
 */
module.exports = function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Não autorizado. Token não informado.');
    error.status = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    const error = new Error('Não autorizado. Token inválido ou expirado.');
    error.status = 401;
    throw error;
  }
};
