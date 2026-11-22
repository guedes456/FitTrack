const adminService = require('./adminService');
const { success } = require('../../middlewares/apiResponse');
const { parsePagination } = require('../../utils/pagination');
const { parseId } = require('../../utils/parseId');
const { SEARCH } = require('../../config/constants');

// ?search= pode NÃO ser texto (?search=a&search=b vira array): só texto vale;
// qualquer outra coisa vira "sem busca". Mesmo corte da busca pública.
function readSearch(req) {
  const raw = typeof req.query.search === 'string' ? req.query.search : '';
  return raw.trim().slice(0, SEARCH.MAX_LENGTH);
}

exports.getDashboard = async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return success(res, stats);
};

exports.getReports = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
  const data = await adminService.getReports(status, page, limit);
  return success(res, data);
};

exports.reviewReport = async (req, res) => {
  const id = parseId(req.params.id, 'denúncia');
  const data = await adminService.reviewReport(id);
  return success(res, data, 'Denúncia marcada como revisada.');
};

exports.getUsers = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const data = await adminService.getUsers(readSearch(req), page, limit);
  return success(res, data);
};

exports.setUserBlocked = async (req, res) => {
  const id = parseId(req.params.id, 'usuário');
  const { isBlocked } = req.body;
  // O id de quem bloqueia vem do req.user (montado a partir do banco), nunca
  // do corpo da requisição.
  const data = await adminService.setUserBlocked(id, isBlocked, req.user.id);
  return success(res, data, isBlocked ? 'Usuário bloqueado.' : 'Usuário desbloqueado.');
};

exports.getWorkouts = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const data = await adminService.getWorkouts(readSearch(req), page, limit);
  return success(res, data);
};

exports.deleteWorkout = async (req, res) => {
  const id = parseId(req.params.id, 'treino');
  await adminService.deleteWorkoutAsAdmin(id, req.user.id);
  return success(res, null, 'Treino excluído com sucesso.');
};
