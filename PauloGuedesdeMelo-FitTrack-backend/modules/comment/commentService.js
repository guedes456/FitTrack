const sequelize = require('../../config/database');
const Workout = require('../workout/workoutModel');
const User = require('../user/userModel');
const Comment = require('./commentModel');
const { AUTHOR_ATTRIBUTES } = require('../workout/workoutService');
const { httpError, parseId } = require('../../utils/httpError');

function toPublicComment(comment) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    workoutId: comment.workoutId,
    user: comment.user
      ? {
          id: comment.user.id,
          username: comment.user.username,
          fullName: comment.user.fullName,
          profilePicture: comment.user.profilePicture
        }
      : null
  };
}

/**
 * ATENÇÃO à ordem dos parâmetros: (userId, workoutId, content). Os dois
 * primeiros são inteiros; trocá-los entre controller e service não gera erro
 * algum, só um comentário gravado com o autor e o treino invertidos.
 */
async function createComment(userId, workoutId, content) {
  const id = parseId(workoutId);

  // Linha em `comments` + contador `commentsCount` do treino: duas escritas,
  // uma transação.
  const createdId = await sequelize.transaction(async (t) => {
    const workout = await Workout.findByPk(id, { transaction: t });
    if (!workout) {
      throw httpError(404, 'Treino não encontrado.');
    }

    const comment = await Comment.create(
      { userId, workoutId: id, content },
      { transaction: t }
    );
    await workout.increment('commentsCount', { by: 1, transaction: t });

    return comment.id;
  });

  // Devolve o comentário COM o autor: o front mostra nome e foto na hora,
  // sem precisar recarregar a lista só para descobrir quem comentou.
  const comment = await Comment.findByPk(createdId, {
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }]
  });
  return toPublicComment(comment);
}

// Mais novos primeiro (o id desempata comentários do mesmo segundo).
async function getComments(workoutId) {
  const id = parseId(workoutId);

  const workout = await Workout.findByPk(id, { attributes: ['id'] });
  if (!workout) {
    throw httpError(404, 'Treino não encontrado.');
  }

  const comments = await Comment.findAll({
    where: { workoutId: id },
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });

  return comments.map(toPublicComment);
}

module.exports = { createComment, getComments };
