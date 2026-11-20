const Report = require('./reportModel');
const Workout = require('../workout/workoutModel');
const { httpError } = require('../../utils/httpError');

/**
 * Denunciar um treino. Ordem dos erros: 404 (não existe) -> 400 (é o seu
 * próprio treino) -> 409 (já denunciou). É UMA escrita só, então não há
 * transação; e o dono NÃO é notificado (denúncia é para a moderação, não para
 * ele).
 */
async function createReport(userId, workoutId, reason) {
  const workout = await Workout.findByPk(workoutId, { attributes: ['id', 'userId'] });
  if (!workout) {
    throw httpError(404, 'Treino não encontrado.');
  }
  if (workout.userId === userId) {
    throw httpError(400, 'Você não pode denunciar o seu próprio treino.');
  }

  try {
    // findOrCreate por (userId, workoutId): o índice único do banco garante
    // que dois cliques simultâneos criam UMA linha; o perdedor da corrida
    // recebe created = false.
    const [report, created] = await Report.findOrCreate({
      where: { userId, workoutId },
      defaults: { reason }
    });

    if (!created) {
      // 409 e NÃO 200: adicionar à rotina é idempotente (repetir dá o mesmo
      // resultado e o cliente quer o mesmo estado final). Denunciar de novo
      // é um conflito que o usuário precisa ver: ele já fez isto.
      throw httpError(409, 'Você já denunciou este treino.');
    }

    return { id: report.id, workoutId: report.workoutId, reason: report.reason };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw httpError(409, 'Você já denunciou este treino.');
    }
    throw err;
  }
}

module.exports = { createReport };
