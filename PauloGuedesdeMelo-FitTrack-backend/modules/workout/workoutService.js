const Workout = require('./workoutModel');
const User = require('../user/userModel');

async function createWorkout(userId, { title, description }, fileName) {
  const workout = await Workout.create({
    title,
    description: description || null,
    image: fileName,
    userId
  });

  // increment() gera um UPDATE atômico (treinos_count = treinos_count + 1)
  // direto no banco — evita a corrida de ler o valor, somar em memória e
  // salvar, que perderia incrementos se dois uploads do mesmo usuário
  // terminassem quase ao mesmo tempo.
  await User.increment('treinosCount', { by: 1, where: { id: userId } });

  return {
    id: workout.id,
    title: workout.title,
    description: workout.description,
    image: workout.image,
    userId: workout.userId,
    createdAt: workout.createdAt
  };
}

// Só estes campos do autor saem na API. Lista explícita (e não "tudo menos a
// senha") para que um campo novo no User nunca vaze sem alguém decidir isso.
const AUTHOR_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];

function notFoundError() {
  const error = new Error('Treino não encontrado.');
  error.status = 404;
  return error;
}

function toPublicWorkout(workout) {
  return {
    id: workout.id,
    title: workout.title,
    description: workout.description,
    image: workout.image,
    viewsCount: workout.viewsCount,
    createdAt: workout.createdAt,
    user: workout.user
      ? {
          id: workout.user.id,
          username: workout.user.username,
          fullName: workout.user.fullName,
          profilePicture: workout.user.profilePicture
        }
      : null
  };
}

async function getWorkoutDetails(workoutId, viewerId) {
  const id = Number(workoutId);
  if (!Number.isInteger(id) || id < 1) {
    throw notFoundError();
  }

  const workout = await Workout.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }]
  });

  if (!workout) {
    throw notFoundError();
  }

  // increment() faz UPDATE views_count = views_count + 1 direto no banco
  // (atômico); depois o reload traz o valor real, inclusive se outra pessoa
  // abriu o mesmo treino ao mesmo tempo.
  await workout.increment('viewsCount', { by: 1 });
  await workout.reload();

  return {
    ...toPublicWorkout(workout),
    // viewerId vem do optionalAuth (null para visitante anônimo).
    isOwner: viewerId != null && viewerId === workout.userId
  };
}

async function getFeedWorkouts({ page, limit }) {
  // page é "a página que o cliente quer" (1, 2, 3...); o banco só entende
  // "quantos registros pular". Página 1 pula 0, página 2 pula `limit`, etc.
  const offset = (page - 1) * limit;

  const { rows, count } = await Workout.findAndCountAll({
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }],
    // id como desempate: dois treinos criados no mesmo segundo não podem
    // trocar de página entre uma requisição e outra.
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset
  });

  return {
    items: rows.map(toPublicWorkout),
    page,
    limit,
    total: count,
    hasMore: offset + rows.length < count
  };
}

module.exports = { createWorkout, getWorkoutDetails, getFeedWorkouts };
