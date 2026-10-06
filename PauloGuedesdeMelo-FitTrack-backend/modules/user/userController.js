const userService = require('./userService');
const workoutService = require('../workout/workoutService');
const { PAGINATION } = require('../../config/constants');
const { success } = require('../../middlewares/apiResponse');

exports.register = async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const newUser = await userService.registerUser(username, email, password, fullName);
  return success(res, newUser, 'Conta criada com sucesso! Faça login para continuar.', 201);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.loginUser(email, password);
  return success(res, result, 'Login realizado com sucesso!');
};

exports.logout = async (req, res) => {
  // Num sistema JWT stateless não há nada para "revogar" no servidor: o token
  // continua válido até expirar sozinho. Esta rota existe só por completude
  // de API / semântica REST — quem de fato encerra a sessão é o front-end,
  // descartando o token guardado localmente.
  return success(res, null, 'Logout realizado com sucesso.');
};

exports.getMyProfile = async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);
  return success(res, user);
};

exports.getPublicProfile = async (req, res) => {
  const user = await userService.getPublicProfile(req.params.username);
  return success(res, user);
};

exports.updateProfile = async (req, res) => {
  const { fullName, bio } = req.body;
  // req.file só existe quando o formulário enviou uma foto nova — o Multer
  // (profileMulter) já rodou antes desta função e populou req.file/req.body.
  const newFileName = req.file ? req.file.filename : null;

  const updatedUser = await userService.updateUserProfile(
    req.user.id,
    { fullName, bio },
    newFileName
  );

  return success(res, updatedUser, 'Perfil atualizado com sucesso!');
};

// Converte o texto da query string num inteiro dentro de [min, max]; qualquer
// valor ausente ou inválido (ex.: ?page=abc) cai no padrão, em vez de virar erro.
function parseIntInRange(value, fallback, min, max) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

exports.getFeed = async (req, res) => {
  const page = parseIntInRange(req.query.page, PAGINATION.DEFAULT_PAGE, 1, Number.MAX_SAFE_INTEGER);
  const limit = parseIntInRange(req.query.limit, PAGINATION.DEFAULT_LIMIT, 1, PAGINATION.MAX_LIMIT);

  const feed = await workoutService.getFeedWorkouts({ page, limit });
  return success(res, feed);
};
