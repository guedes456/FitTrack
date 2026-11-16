const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const Routine = require('./routineModel');
const RoutineWorkout = require('./routineWorkoutModel');
const Workout = require('../workout/workoutModel');
const User = require('../user/userModel');
const { AUTHOR_ATTRIBUTES, toPublicWorkout } = require('../workout/workoutService');
const { httpError } = require('../../utils/httpError');

function toPublicRoutine(routine) {
  return {
    id: routine.id,
    title: routine.title,
    description: routine.description,
    isPublic: routine.isPublic,
    treinosCount: routine.treinosCount,
    createdAt: routine.createdAt,
    user: routine.user
      ? {
          id: routine.user.id,
          username: routine.user.username,
          fullName: routine.user.fullName,
          profilePicture: routine.user.profilePicture
        }
      : null
  };
}

// Usada por adicionar, remover e excluir: 404 se a rotina não existe e,
// DEPOIS, 403 se existe mas é de outra pessoa. (Nessa ordem: quem não existe
// não tem dono para ser comparado.) `transaction` é opcional.
async function findOwnedRoutineOrFail(routineId, userId, transaction) {
  const routine = await Routine.findByPk(routineId, { transaction });
  if (!routine) {
    throw httpError(404, 'Rotina não encontrada.');
  }
  if (routine.userId !== userId) {
    throw httpError(403, 'Você não tem permissão para alterar esta rotina.');
  }
  return routine;
}

async function createRoutine(userId, { title, description, isPublic }) {
  const routine = await Routine.create({
    title,
    description: description || null,
    // === true, e não Boolean(isPublic): Boolean("false") é true (texto
    // não vazio). Só o booleano verdadeiro de fato torna a rotina pública.
    isPublic: isPublic === true,
    userId
  });
  return toPublicRoutine(routine);
}

async function getUserRoutines(userId) {
  const routines = await Routine.findAll({
    where: { userId },
    // id como desempate: createdAt tem precisão de segundos, e duas rotinas
    // criadas no mesmo segundo teriam datas iguais (ordem indefinida).
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });
  return routines.map(toPublicRoutine);
}

async function getRoutineById(routineId, currentUserId = null) {
  const routine = await Routine.findByPk(routineId, {
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }]
  });
  if (!routine) {
    throw httpError(404, 'Rotina não encontrada.');
  }

  // Visitante: currentUserId é null, e routine.userId nunca é null. Sem a
  // checagem `!== null`, um visitante casaria com um userId indefinido.
  const isOwner = currentUserId !== null && routine.userId === currentUserId;

  // Privada de outra pessoa: 403. (A alternativa seria 404, para nem revelar
  // que a rotina existe — escolha de produto; aqui dizemos que é privada.)
  if (!routine.isPublic && !isOwner) {
    throw httpError(403, 'Esta rotina é privada.');
  }

  const links = await RoutineWorkout.findAll({
    where: { routineId: routine.id },
    include: [{
      model: Workout,
      as: 'workout',
      include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }]
    }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });
  const items = links.filter((link) => link.workout).map((link) => toPublicWorkout(link.workout));

  return { routine: toPublicRoutine(routine), items, isOwner };
}

async function addToRoutine(userId, routineId, workoutId) {
  // 404 / 403 da rotina, depois 404 do treino — antes de abrir a transação.
  await findOwnedRoutineOrFail(routineId, userId);
  const workout = await Workout.findByPk(workoutId, { attributes: ['id'] });
  if (!workout) {
    throw httpError(404, 'Treino não encontrado.');
  }

  return sequelize.transaction(async (t) => {
    // Idempotente: se a linha já existe, `created` é false e NADA muda.
    const [, created] = await RoutineWorkout.findOrCreate({
      where: { routineId, workoutId },
      transaction: t
    });

    // O contador só sobe se a linha foi criada agora. Fora deste if, cada
    // clique repetido inflaria o contador sem criar nenhuma linha.
    const routine = await Routine.findByPk(routineId, { transaction: t });
    if (created) {
      await routine.increment('treinosCount', { by: 1, transaction: t });
    }
    await routine.reload({ transaction: t });

    return { added: created, treinosCount: routine.treinosCount };
  });
}

async function removeFromRoutine(userId, routineId, workoutId) {
  await findOwnedRoutineOrFail(routineId, userId);

  return sequelize.transaction(async (t) => {
    // destroy devolve QUANTAS linhas apagou: 0 = o treino não estava lá.
    const deleted = await RoutineWorkout.destroy({
      where: { routineId, workoutId },
      transaction: t
    });
    if (deleted === 0) {
      throw httpError(404, 'Este treino não está na rotina.');
    }

    // O contador só desce se algo foi apagado (e nunca abaixo de zero).
    await Routine.decrement('treinosCount', {
      by: 1,
      where: { id: routineId, treinosCount: { [Op.gt]: 0 } },
      transaction: t
    });
    const routine = await Routine.findByPk(routineId, { transaction: t });

    return { removed: true, treinosCount: routine.treinosCount };
  });
}

async function deleteRoutine(userId, routineId) {
  const routine = await findOwnedRoutineOrFail(routineId, userId);

  await sequelize.transaction(async (t) => {
    // Linhas da junção ANTES da rotina (não dependemos só do CASCADE). Os
    // treinos em si NÃO são apagados: só deixam de estar nesta rotina.
    await RoutineWorkout.destroy({ where: { routineId: routine.id }, transaction: t });
    await routine.destroy({ transaction: t });
  });
}

// Alimenta o modal "Salvar": as MINHAS rotinas, cada uma com hasWorkout
// dizendo se o treino já está nela.
async function getRoutinesStatusForWorkout(userId, workoutId) {
  const workout = await Workout.findByPk(workoutId, { attributes: ['id'] });
  if (!workout) {
    throw httpError(404, 'Treino não encontrado.');
  }

  const routines = await Routine.findAll({
    where: { userId },
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });

  const links = routines.length
    ? await RoutineWorkout.findAll({
        where: { workoutId, routineId: routines.map((r) => r.id) },
        attributes: ['routineId']
      })
    : [];
  const routineIdsWithWorkout = new Set(links.map((link) => link.routineId));

  return routines.map((routine) => ({
    id: routine.id,
    title: routine.title,
    isPublic: routine.isPublic,
    treinosCount: routine.treinosCount,
    hasWorkout: routineIdsWithWorkout.has(routine.id)
  }));
}

module.exports = {
  createRoutine,
  getUserRoutines,
  getRoutineById,
  addToRoutine,
  removeFromRoutine,
  deleteRoutine,
  getRoutinesStatusForWorkout
};
