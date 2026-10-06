const { verifyToken } = require('../config/jwt');

/**
 * Identifica quem está pedindo, mas NUNCA bloqueia.
 *
 * Diferença para o isAuthenticated (middlewares/auth.js):
 *  - isAuthenticated: sem token válido -> 401, a rota nem executa.
 *  - optionalAuth:    sem token, ou com token inválido/expirado -> a rota
 *                     executa do mesmo jeito, só que com req.user indefinido
 *                     (visitante anônimo). Com token válido, req.user recebe
 *                     o payload ({ id, username, isAdmin }), igual ao auth.js.
 *
 * É o que o detalhe do treino precisa: qualquer pessoa pode ver o treino
 * (rota pública), mas, se quem vê for o dono, a API consegue dizer isso
 * (isOwner) para o front decidir, nas próximas aulas, se mostra botões de
 * editar/excluir.
 */
module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(authHeader.split(' ')[1]);
    } catch (err) {
      // Token inválido ou expirado: segue como visitante, sem erro.
    }
  }

  return next();
};
