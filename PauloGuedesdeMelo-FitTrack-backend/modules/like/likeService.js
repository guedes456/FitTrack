const sequelize = require('../../config/database');
const Workout = require('../workout/workoutModel');
const User = require('../user/userModel');
const Like = require('./likeModel');
const { AUTHOR_ATTRIBUTES, toPublicWorkout } = require('../workout/workoutService');
const { httpError, parseId } = require('../../utils/httpError');

/**
 * Curtir / descurtir (toggle). Cada curtida mexe em DUAS coisas: a linha em
 * `likes` e o contador `likesCount` do treino. Se só uma das duas mudasse
 * (um erro no meio do caminho), o contador guardado ficaria diferente do
 * número real de linhas. Por isso as duas escritas acontecem dentro de uma
 * transação: ou as duas valem, ou nenhuma.
 *
 * ATENÇÃO à ordem dos parâmetros: (userId, workoutId). São dois inteiros,
 * então trocá-los não dá erro nenhum — só curtidas gravadas no lugar errado.
 */
async function toggleLike(userId, workoutId) {
  const id = parseId(workoutId);

  try {
    return await sequelize.transaction(async (t) => {
      // Todo comando abaixo recebe { transaction: t }. Se um esquecer, ele
      // usa outra conexão do pool, fora da transação: não enxerga o que a
      // transação ainda não confirmou e NÃO é desfeito num rollback.
      // lock: UPDATE = SELECT ... FOR UPDATE. Trava a linha do treino até o
      // fim da transação, então dois toggles do MESMO treino (por exemplo,
      // dois cliques seguidos) são executados um depois do outro, e não ao
      // mesmo tempo. Sem a trava, duas transações liam "já curtiu" juntas, as
      // duas apagavam a linha e as duas decrementavam o contador (que ficava
      // abaixo do número real de curtidas).
      const workout = await Workout.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!workout) {
        throw httpError(404, 'Treino não encontrado.');
      }

      const existing = await Like.findOne({
        where: { userId, workoutId: id },
        transaction: t
      });

      if (existing) {
        await existing.destroy({ transaction: t });
        await workout.decrement('likesCount', { by: 1, transaction: t });
        await workout.reload({ transaction: t });
        return { liked: false, likesCount: workout.likesCount };
      }

      await Like.create({ userId, workoutId: id }, { transaction: t });
      await workout.increment('likesCount', { by: 1, transaction: t });
      await workout.reload({ transaction: t });
      return { liked: true, likesCount: workout.likesCount };
    });
  } catch (err) {
    // Dois cliques simultâneos do mesmo usuário passam juntos pela checagem
    // "já curtiu?"; o segundo INSERT é recusado pelo índice único do banco.
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw httpError(409, 'Sua curtida já foi registrada. Tente novamente.');
    }
    throw err;
  }
}

// viewerId vem do optionalAuth: null = visitante anônimo (nunca curtiu).
async function getLikeStatus(viewerId, workoutId) {
  const id = parseId(workoutId);

  const workout = await Workout.findByPk(id, { attributes: ['id', 'likesCount'] });
  if (!workout) {
    throw httpError(404, 'Treino não encontrado.');
  }

  const liked = viewerId != null
    ? Boolean(await Like.findOne({ where: { userId: viewerId, workoutId: id } }))
    : false;

  return { liked, likesCount: workout.likesCount };
}

// Treinos que o usuário curtiu, do curtido mais recentemente para o mais
// antigo, cada um com o autor.
async function getLikedWorkouts(userId) {
  const workouts = await Workout.findAll({
    include: [
      // required + where: só treinos que TÊM uma curtida deste usuário.
      { model: Like, as: 'likes', where: { userId }, attributes: [], required: true },
      { model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }
    ],
    order: [[{ model: Like, as: 'likes' }, 'createdAt', 'DESC'], ['id', 'DESC']]
  });

  return workouts.map(toPublicWorkout);
}

module.exports = { toggleLike, getLikeStatus, getLikedWorkouts };
