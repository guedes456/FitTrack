const followService = require('./followService');
const workoutService = require('../workout/workoutService');
const { success } = require('../../middlewares/apiResponse');
const { httpError } = require('../../utils/httpError');
const { parsePagination } = require('../../utils/pagination');

// req.params.userId é SEMPRE texto ("2"), e o id do token (req.user.id) é
// número. Comparar "2" === 2 dá false, então "seguir a si mesmo" nunca era
// detectado. A conversão acontece AQUI, na borda (onde o dado entra), para
// que o service só receba números; lixo ("abc", "0", "-1", "1.5") vira 400.
function parseUserId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw httpError(400, 'Id de usuário inválido.');
  }
  return id;
}

exports.toggleFollow = async (req, res) => {
  const followingId = parseUserId(req.params.userId);
  const result = await followService.toggleFollow(req.user.id, followingId);

  // 201 quando uma relação foi CRIADA; 200 quando foi desfeita.
  return result.isFollowing
    ? success(res, result, 'Agora você segue esta pessoa.', 201)
    : success(res, result, 'Você deixou de seguir esta pessoa.', 200);
};

exports.getFollowStatus = async (req, res) => {
  const userId = parseUserId(req.params.userId);
  const status = await followService.getFollowStatus(req.user.id, userId);
  return success(res, status);
};

exports.getFollowers = async (req, res) => {
  const followers = await followService.getFollowers(parseUserId(req.params.userId));
  return success(res, followers);
};

exports.getFollowing = async (req, res) => {
  const following = await followService.getFollowing(parseUserId(req.params.userId));
  return success(res, following);
};

// Feed só com os treinos de quem o usuário logado segue.
exports.getFollowingWorkouts = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const feed = await workoutService.getFollowingWorkouts(req.user.id, { page, limit });
  return success(res, feed);
};
