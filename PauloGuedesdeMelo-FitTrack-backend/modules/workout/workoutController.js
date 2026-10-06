const workoutService = require('./workoutService');
const { success } = require('../../middlewares/apiResponse');

exports.createWorkout = async (req, res) => {
  const { title, description } = req.body;
  const fileName = req.file.filename;

  const workout = await workoutService.createWorkout(
    req.user.id,
    { title, description },
    fileName
  );

  return success(res, workout, 'Treino enviado com sucesso!', 201);
};

exports.getWorkoutDetails = async (req, res) => {
  // req.user só existe se o optionalAuth reconheceu um token válido.
  const viewerId = req.user ? req.user.id : null;
  const workout = await workoutService.getWorkoutDetails(req.params.id, viewerId);
  return success(res, workout);
};
