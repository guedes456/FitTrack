const likeService = require('./likeService');
const { success } = require('../../middlewares/apiResponse');

exports.toggleLike = async (req, res) => {
  // Ordem: (userId, workoutId). userId vem do token; workoutId, da URL.
  const result = await likeService.toggleLike(req.user.id, req.params.workoutId);

  // 201 quando uma curtida foi CRIADA; 200 quando foi removida.
  return result.liked
    ? success(res, result, 'Treino curtido.', 201)
    : success(res, result, 'Curtida removida.', 200);
};

exports.getLikeStatus = async (req, res) => {
  const viewerId = req.user ? req.user.id : null;
  const status = await likeService.getLikeStatus(viewerId, req.params.workoutId);
  return success(res, status);
};

exports.getLikedWorkouts = async (req, res) => {
  const workouts = await likeService.getLikedWorkouts(req.user.id);
  return success(res, workouts);
};
