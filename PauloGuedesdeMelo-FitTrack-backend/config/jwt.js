require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!JWT_SECRET) {
  // Falha rápido: sem segredo configurado, não faz sentido subir a API.
  throw new Error('JWT_SECRET não definido no .env — configure antes de iniciar a API.');
}

/**
 * Gera um token JWT assinado.
 * O payload deve conter só o essencial para identificar o usuário
 * (id, username, isAdmin) — nunca dados sensíveis, já que o payload
 * é apenas codificado em Base64 (qualquer um pode ler), não criptografado.
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica a assinatura e a validade (expiração) de um token.
 * Lança um erro (jsonwebtoken) se o token for inválido ou tiver expirado —
 * quem chamar esta função deve tratar isso com try/catch.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken, JWT_SECRET, JWT_EXPIRES_IN };
