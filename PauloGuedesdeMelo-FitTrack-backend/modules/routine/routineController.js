const routineService = require('./routineService');
const { success } = require('../../middlewares/apiResponse');
const { parseId } = require('../../utils/parseId');

// Todo id que chega de req.params OU do corpo passa por parseId (400 se for
// lixo) ANTES de chegar ao service.

exports.getMyRoutines = async (req, res) => {
  const routines = await routineService.getUserRoutines(req.user.id);
  return success(res, routines);
};

exports.createRoutine = async (req, res) => {
  const routine = await routineService.createRoutine(req.user.id, req.body);
  return success(res, routine, 'Rotina criada com sucesso!', 201);
};

exports.getRoutineDetails = async (req, res) => {
  const routineId = parseId(req.params.id, 'rotina');
  const viewerId = req.user ? req.user.id : null;
  const { routine, items, isOwner } = await routineService.getRoutineById(routineId, viewerId);
  return success(res, { ...routine, treinos: items, isOwner });
};

exports.deleteRoutine = async (req, res) => {
  const routineId = parseId(req.params.id, 'rotina');
  await routineService.deleteRoutine(req.user.id, routineId);
  return success(res, null, 'Rotina excluída com sucesso.');
};

exports.addWorkout = async (req, res) => {
  const routineId = parseId(req.params.id, 'rotina');
  const workoutId = parseId(req.body.workoutId, 'treino');
  const result = await routineService.addToRoutine(req.user.id, routineId, workoutId);

  // 201 na primeira vez (linha criada); 200 na repetição (já estava).
  return result.added
    ? success(res, result, 'Treino adicionado à rotina.', 201)
    : success(res, result, 'Este treino já estava na rotina.', 200);
};

exports.removeWorkout = async (req, res) => {
  const routineId = parseId(req.params.id, 'rotina');
  const workoutId = parseId(req.params.workoutId, 'treino');
  const result = await routineService.removeFromRoutine(req.user.id, routineId, workoutId);
  return success(res, result, 'Treino removido da rotina.');
};

exports.getRoutinesStatus = async (req, res) => {
  const workoutId = parseId(req.params.workoutId, 'treino');
  const status = await routineService.getRoutinesStatusForWorkout(req.user.id, workoutId);
  return success(res, status);
};
