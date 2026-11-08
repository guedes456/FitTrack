const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../user/userModel');
const Follow = require('./followModel');
const { httpError } = require('../../utils/httpError');

// Só estes campos da pessoa saem nas listas (nunca password nem e-mail).
const PERSON_ATTRIBUTES = ['id', 'username', 'fullName', 'bio', 'profilePicture'];

function toPerson(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    bio: user.bio,
    profilePicture: user.profilePicture
  };
}

async function assertUserExists(userId) {
  const user = await User.findByPk(userId, { attributes: ['id'] });
  if (!user) {
    throw httpError(404, 'Usuário não encontrado.');
  }
}

/**
 * Seguir / deixar de seguir (toggle). Três escritas: a linha em `follows`, o
 * followersCount de QUEM É SEGUIDO e o followingCount de QUEM SEGUE. As três
 * numa transação: ou todas valem, ou nenhuma.
 *
 * Os dois ids chegam aqui como NÚMEROS (a conversão acontece na borda, no
 * controller). Se um deles fosse a string "2", `followerId === followingId`
 * seria sempre false e alguém conseguiria seguir a si mesmo.
 */
async function toggleFollow(followerId, followingId) {
  if (followerId === followingId) {
    throw httpError(400, 'Você não pode seguir a si mesmo.');
  }

  try {
    return await sequelize.transaction(async (t) => {
      // Trava as DUAS linhas de usuário (FOR UPDATE) sempre na mesma ordem
      // (menor id primeiro). Isso serializa toggles simultâneos e evita
      // deadlock quando A segue B ao mesmo tempo em que B segue A: se cada
      // transação travasse "a minha linha" e depois "a do outro", as duas
      // ficariam esperando uma pela outra.
      const users = await User.findAll({
        where: { id: { [Op.in]: [followerId, followingId] } },
        order: [['id', 'ASC']],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      const target = users.find((u) => u.id === followingId);
      if (!target) {
        throw httpError(404, 'Usuário não encontrado.');
      }

      // Todo comando recebe { transaction: t }: sem isso rodaria numa conexão
      // separada, fora da transação, e não seria desfeito num rollback.
      const [follow, created] = await Follow.findOrCreate({
        where: { followerId, followingId },
        transaction: t
      });

      if (created) {
        // followersCount sobe em quem É SEGUIDO; followingCount, em quem SEGUE.
        await User.increment('followersCount', { by: 1, where: { id: followingId }, transaction: t });
        await User.increment('followingCount', { by: 1, where: { id: followerId }, transaction: t });
      } else {
        await follow.destroy({ transaction: t });
        // Nunca abaixo de zero.
        await User.decrement('followersCount', {
          by: 1,
          where: { id: followingId, followersCount: { [Op.gt]: 0 } },
          transaction: t
        });
        await User.decrement('followingCount', {
          by: 1,
          where: { id: followerId, followingCount: { [Op.gt]: 0 } },
          transaction: t
        });
      }

      // O increment/decrement mexeu no banco; o reload traz o valor real.
      await target.reload({ transaction: t });
      return { isFollowing: created, followersCount: target.followersCount };
    });
  } catch (err) {
    // Dois cliques simultâneos: o índice único do banco recusa o segundo INSERT.
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw httpError(409, 'Ação já registrada. Tente novamente.');
    }
    throw err;
  }
}

async function getFollowStatus(viewerId, userId) {
  await assertUserExists(userId);
  const isFollowing = viewerId !== userId && Boolean(
    await Follow.findOne({ where: { followerId: viewerId, followingId: userId } })
  );
  return { isFollowing };
}

// Quem SEGUE o usuário: linhas em que followingId = usuário; o include traz
// o Follower (a pessoa que está do outro lado da linha).
async function getFollowers(userId) {
  await assertUserExists(userId);
  const rows = await Follow.findAll({
    where: { followingId: userId },
    include: [{ model: User, as: 'Follower', attributes: PERSON_ATTRIBUTES }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });
  return rows.map((row) => toPerson(row.Follower));
}

// Quem o usuário SEGUE: linhas em que followerId = usuário; o include traz o
// Following.
async function getFollowing(userId) {
  await assertUserExists(userId);
  const rows = await Follow.findAll({
    where: { followerId: userId },
    include: [{ model: User, as: 'Following', attributes: PERSON_ATTRIBUTES }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });
  return rows.map((row) => toPerson(row.Following));
}

module.exports = { toggleFollow, getFollowStatus, getFollowers, getFollowing };
