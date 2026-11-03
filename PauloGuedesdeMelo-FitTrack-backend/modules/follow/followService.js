const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../user/userModel');
const Follow = require('./followModel');
const { AUTHOR_ATTRIBUTES } = require('../workout/workoutService');
const { httpError } = require('../../utils/httpError');

/**
 * Seguir / deixar de seguir (toggle). Cada ação mexe em TRÊS coisas: a linha
 * em `follows`, o followersCount de QUEM É SEGUIDO e o followingCount de QUEM
 * SEGUE. Se uma das três falhasse sozinha, os contadores deixariam de bater
 * com as linhas. Por isso as três escritas ficam numa transação só.
 *
 * ATENÇÃO à ordem dos parâmetros: (followerId, targetUserId). São dois
 * inteiros — trocá-los não dá erro, só grava a relação ao contrário.
 * Os dois chegam AQUI já como número: o controller converte req.params.userId
 * (parseUserId) e o id do token já é número. Com string, `===` nunca dá true.
 */
async function toggleFollow(followerId, targetUserId) {
  // 1) Seguir a si mesmo: 400 (antes de qualquer consulta ao banco).
  if (followerId === targetUserId) {
    throw httpError(400, 'Você não pode seguir a si mesmo.');
  }

  // 2) O alvo existe? 404 se não.
  const target = await User.findByPk(targetUserId, { attributes: ['id', 'followersCount'] });
  if (!target) {
    throw httpError(404, 'Usuário não encontrado.');
  }

  try {
    return await sequelize.transaction(async (t) => {
      // Trava as DUAS linhas de usuário até o fim da transação, SEMPRE em
      // ordem crescente de id. Sem a trava, dois toggles simultâneos liam
      // "ainda não segue" juntos e os contadores se desencontravam. Sem a
      // ordem fixa, A seguindo B e B seguindo A ao mesmo tempo travariam uma
      // linha cada e ficariam esperando um pelo outro (deadlock).
      await User.findAll({
        where: { id: { [Op.in]: [followerId, targetUserId] } },
        attributes: ['id'],
        order: [['id', 'ASC']],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      // Todo comando abaixo recebe { transaction: t }; um que esqueça roda em
      // outra conexão, fora da transação, e não é desfeito num rollback.
      const [follow, created] = await Follow.findOrCreate({
        where: { followerId, followingId: targetUserId },
        transaction: t
      });

      if (created) {
        // followersCount sobe em QUEM É SEGUIDO; followingCount, em QUEM SEGUE.
        await User.increment('followersCount', { by: 1, where: { id: targetUserId }, transaction: t });
        await User.increment('followingCount', { by: 1, where: { id: followerId }, transaction: t });
      } else {
        await follow.destroy({ transaction: t });
        // Op.gt 0: o contador nunca fica abaixo de zero.
        await User.decrement('followersCount', {
          by: 1,
          where: { id: targetUserId, followersCount: { [Op.gt]: 0 } },
          transaction: t
        });
        await User.decrement('followingCount', {
          by: 1,
          where: { id: followerId, followingCount: { [Op.gt]: 0 } },
          transaction: t
        });
      }

      await target.reload({ transaction: t });
      return { isFollowing: created, followersCount: target.followersCount };
    });
  } catch (err) {
    // Dois cliques simultâneos: o segundo INSERT é recusado pelo índice único.
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw httpError(409, 'Sua ação já foi registrada. Tente novamente.');
    }
    throw err;
  }
}

async function assertUserExists(userId) {
  const user = await User.findByPk(userId, { attributes: ['id'] });
  if (!user) {
    throw httpError(404, 'Usuário não encontrado.');
  }
}

// O usuário logado (viewerId) segue o usuário targetUserId?
async function getFollowStatus(viewerId, targetUserId) {
  await assertUserExists(targetUserId);

  const isFollowing = Boolean(
    await Follow.findOne({ where: { followerId: viewerId, followingId: targetUserId } })
  );
  return { isFollowing };
}

// Lendo em voz alta: "os SEGUIDORES de X" = as linhas em que X é o
// followingId (o seguido), e a pessoa que queremos é o Follower daquela linha.
async function getFollowers(userId) {
  await assertUserExists(userId);

  const rows = await Follow.findAll({
    where: { followingId: userId },
    include: [{ model: User, as: 'Follower', attributes: AUTHOR_ATTRIBUTES }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });
  return rows.map((row) => row.Follower);
}

// "Quem X SEGUE" = as linhas em que X é o followerId, e a pessoa que
// queremos é o Following daquela linha.
async function getFollowing(userId) {
  await assertUserExists(userId);

  const rows = await Follow.findAll({
    where: { followerId: userId },
    include: [{ model: User, as: 'Following', attributes: AUTHOR_ATTRIBUTES }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });
  return rows.map((row) => row.Following);
}

module.exports = { toggleFollow, getFollowStatus, getFollowers, getFollowing };
