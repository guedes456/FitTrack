const Notification = require('./notificationModel');
const Workout = require('../workout/workoutModel');
const User = require('../user/userModel');
const { AUTHOR_ATTRIBUTES } = require('../workout/workoutService');
const { httpError } = require('../../utils/httpError');

function toPublicNotification(notification) {
  const actor = notification.Actor;
  const workout = notification.Workout;
  return {
    id: notification.id,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    workoutId: notification.workoutId,
    // Só os atributos públicos de quem agiu (nada de senha, e-mail, isAdmin).
    actor: actor
      ? { id: actor.id, username: actor.username, fullName: actor.fullName, profilePicture: actor.profilePicture }
      : null,
    // Só o que a tela precisa do treino: id, título e imagem.
    workout: workout ? { id: workout.id, title: workout.title, image: workout.image } : null
  };
}

/**
 * Cria o aviso. É chamada de DENTRO das transações de curtir, comentar e
 * seguir, por isso recebe a transação e a repassa ao create: o aviso nasce na
 * MESMA transação da ação (ou os dois valem, ou nenhum). Se o `transaction`
 * fosse esquecido, o INSERT iria por outra conexão e ficaria esperando um
 * lock que a transação da ação ainda segura: a requisição trava e, uns 50
 * segundos depois, responde 500 "Lock wait timeout exceeded".
 *
 * Ninguém é avisado das próprias ações: curtir o próprio treino não gera nada.
 */
async function createNotification({ userId, actorId, type, workoutId = null }, transaction) {
  if (userId === actorId) {
    return null;
  }
  return Notification.create({ userId, actorId, type, workoutId }, { transaction });
}

/**
 * Apaga o aviso quando a ação é DESFEITA (descurtir, deixar de seguir). Os
 * quatro dados no where identificam exatamente o aviso daquela ação; com
 * workoutId null, o Sequelize gera "workout_id IS NULL" (caso do follow).
 */
async function removeNotification({ userId, actorId, type, workoutId = null }, transaction) {
  return Notification.destroy({ where: { userId, actorId, type, workoutId }, transaction });
}

// Minhas notificações, a mais nova primeiro (o id desempata o mesmo segundo).
async function getUserNotifications(userId, page, limit) {
  const { rows, count } = await Notification.findAndCountAll({
    where: { userId },
    include: [
      { model: User, as: 'Actor', attributes: AUTHOR_ATTRIBUTES },
      { model: Workout, as: 'Workout', attributes: ['id', 'title', 'image'] }
    ],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  return {
    items: rows.map(toPublicNotification),
    page,
    limit,
    total: count,
    hasMore: page * limit < count
  };
}

// Número do sino. Rota própria (e leve): o front pergunta isto a cada 30 s;
// buscar a lista inteira (com include de usuário e treino) só para contar
// seria muito mais caro.
async function getUnreadCount(userId) {
  return Notification.count({ where: { userId, isRead: false } });
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findByPk(notificationId);
  if (!notification) {
    throw httpError(404, 'Notificação não encontrada.');
  }
  if (notification.userId !== userId) {
    throw httpError(403, 'Você não tem permissão para alterar esta notificação.');
  }

  // Idempotente: só escreve se ainda não estava lida. E o await é obrigatório:
  // sem ele, o count abaixo rodaria ANTES do update terminar e devolveria o
  // número velho.
  if (!notification.isRead) {
    await notification.update({ isRead: true });
  }

  const unreadCount = await getUnreadCount(userId);
  return { id: notification.id, isRead: true, unreadCount };
}

module.exports = {
  createNotification,
  removeNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead
};
