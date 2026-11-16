const followService = require('./followService');
const workoutService = require('../workout/workoutService');
const { success } = require('../../middlewares/apiResponse');
const { parseId } = require('../../utils/parseId');
const { parsePagination } = require('../../utils/pagination');

// req.params.userId é SEMPRE texto ("2"), e o id do token (req.user.id) é
// número: a conversão acontece na borda, com parseId (400 se for lixo).
exports.toggleFollow = async (req, res) => {
  const followingId = parseId(req.params.userId, 'usuário');
  const result = await followService.toggleFollow(req.user.id, followingId);

  // 201 quando uma relação foi CRIADA; 200 quando foi desfeita.
  return result.isFollowing
    ? success(res, result, 'Agora você segue esta pessoa.', 201)
    : success(res, result, 'Você deixou de seguir esta pessoa.', 200);
};

exports.getFollowStatus = async (req, res) => {
  const userId = parseId(req.params.userId, 'usuário');
  const status = await followService.getFollowStatus(req.user.id, userId);
  return success(res, status);
};

exports.getFollowers = async (req, res) => {
  const followers = await followService.getFollowers(parseId(req.params.userId, 'usuário'));
  return success(res, followers);
};

exports.getFollowing = async (req, res) => {
  const following = await followService.getFollowing(parseId(req.params.userId, 'usuário'));
  return success(res, following);
};

// Feed só com os treinos de quem o usuário logado segue.
exports.getFollowingWorkouts = async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const feed = await workoutService.getFollowingWorkouts(req.user.id, { page, limit });
  return success(res, feed);
};
