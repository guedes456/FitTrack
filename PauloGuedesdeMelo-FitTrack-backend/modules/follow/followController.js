const followService = require('./followService');
const workoutService = require('../workout/workoutService');
const { PAGINATION } = require('../../config/constants');
const { success } = require('../../middlewares/apiResponse');
const { httpError } = require('../../utils/httpError');
const { parseIntInRange } = require('../../utils/pagination');

// req.params.userId é SEMPRE texto ("2"). O id que vem do token é número (2),
// e `"2" === 2` é false: sem converter aqui, a checagem "seguir a si mesmo"
// do service nunca dispararia. A conversão acontece na borda (aqui) e o
// service só recebe números. Qualquer coisa que não seja inteiro positivo
// ("abc", "1.5", "0", "-3") vira 400.
function parseUserId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw httpError(400, 'Id de usuário inválido.');
  }
  return id;
}

exports.toggleFollow = async (req, res) => {
  // Ordem: (followerId, targetUserId). followerId vem do token; o alvo, da URL.
  const result = await followService.toggleFollow(req.user.id, parseUserId(req.params.userId));

  // 201 quando uma relação foi CRIADA; 200 quando foi removida.
  return result.isFollowing
    ? success(res, result, 'Agora você segue este usuário.', 201)
    : success(res, result, 'Você deixou de seguir este usuário.', 200);
};

exports.getFollowStatus = async (req, res) => {
  const status = await followService.getFollowStatus(req.user.id, parseUserId(req.params.userId));
  return success(res, status);
};

exports.getFollowers = async (req, res) => {
  const people = await followService.getFollowers(parseUserId(req.params.userId));
  return success(res, people);
};

exports.getFollowing = async (req, res) => {
  const people = await followService.getFollowing(parseUserId(req.params.userId));
  return success(res, people);
};

// Feed só com os treinos de quem o usuário logado segue (?page=1&limit=12).
exports.getFollowingWorkouts = async (req, res) => {
  const page = parseIntInRange(req.query.page, PAGINATION.DEFAULT_PAGE, 1, Number.MAX_SAFE_INTEGER);
  const limit = parseIntInRange(req.query.limit, PAGINATION.DEFAULT_LIMIT, 1, PAGINATION.MAX_LIMIT);

  const feed = await workoutService.getFollowingWorkouts(req.user.id, page, limit);
  return success(res, feed);
};
