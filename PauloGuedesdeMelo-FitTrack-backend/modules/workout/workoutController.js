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

exports.getMyWorkouts = async (req, res) => {
  const workouts = await workoutService.getMyWorkouts(req.user.id);
  return success(res, workouts);
};

exports.getWorkoutForEdit = async (req, res) => {
  const workout = await workoutService.getWorkoutForEdit(req.params.id, req.user.id);
  return success(res, workout);
};

exports.updateWorkout = async (req, res) => {
  const { title, description } = req.body;
  // req.file só existe se o formulário enviou uma imagem nova (Multer opcional).
  const newFileName = req.file ? req.file.filename : null;

  const workout = await workoutService.updateWorkout(
    req.params.id,
    req.user.id,
    { title, description },
    newFileName
  );

  return success(res, workout, 'Treino atualizado com sucesso!');
};

exports.deleteWorkout = async (req, res) => {
  await workoutService.deleteWorkout(req.params.id, req.user.id);
  return success(res, null, 'Treino excluído com sucesso.');
};
