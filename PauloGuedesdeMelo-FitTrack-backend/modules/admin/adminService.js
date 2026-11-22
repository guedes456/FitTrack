const { Op, fn, col } = require('sequelize');
const User = require('../user/userModel');
const Workout = require('../workout/workoutModel');
const Like = require('../like/likeModel');
const Comment = require('../comment/commentModel');
const Report = require('../report/reportModel');
const workoutService = require('../workout/workoutService');
const escapeLike = require('../../utils/escapeLike');
const { httpError } = require('../../utils/httpError');
const { REPORT } = require('../../config/constants');

const { AUTHOR_ATTRIBUTES } = workoutService;

// Offset de página: página 1 pula 0, página 2 pula `limit`...
// LIMITAÇÃO CONHECIDA: se a lista mudar entre uma página e a seguinte (por
// exemplo, uma denúncia revisada sai do filtro "pendentes"), o offset PULA um
// item. O conserto (paginação por cursor) fica para a Aula 18.
const offsetOf = (page, limit) => (page - 1) * limit;

/** Sete contagens em paralelo (independentes entre si). */
async function getDashboardStats() {
  const [users, blockedUsers, workouts, comments, likes, pendingReports, reviewedReports] =
    await Promise.all([
      User.count(),
      User.count({ where: { isBlocked: true } }),
      Workout.count(),
      Comment.count(),
      Like.count(),
      Report.count({ where: { status: REPORT.STATUS.PENDING } }),
      Report.count({ where: { status: REPORT.STATUS.REVIEWED } })
    ]);

  return { users, blockedUsers, workouts, comments, likes, pendingReports, reviewedReports };
}

function toAdminReport(report) {
  const workout = report.Workout;
  return {
    id: report.id,
    reason: report.reason,
    status: report.status,
    createdAt: report.createdAt,
    reviewedAt: report.reviewedAt,
    reporter: report.Reporter
      ? {
          id: report.Reporter.id,
          username: report.Reporter.username,
          fullName: report.Reporter.fullName,
          profilePicture: report.Reporter.profilePicture
        }
      : null,
    workout: workout
      ? {
          id: workout.id,
          title: workout.title,
          image: workout.image,
          user: workout.user
            ? {
                id: workout.user.id,
                username: workout.user.username,
                fullName: workout.user.fullName,
                profilePicture: workout.user.profilePicture
              }
            : null
        }
      : null
  };
}

async function getReports(status, page, limit) {
  const offset = offsetOf(page, limit);
  // 'all' = sem filtro.
  const where = status === 'all' ? {} : { status };

  const { rows, count } = await Report.findAndCountAll({
    where,
    include: [
      { model: User, as: 'Reporter', attributes: AUTHOR_ATTRIBUTES },
      {
        model: Workout,
        as: 'Workout',
        attributes: ['id', 'title', 'image'],
        include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }]
      }
    ],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset
  });

  return {
    items: rows.map(toAdminReport),
    page,
    limit,
    total: count,
    hasMore: offset + rows.length < count
  };
}

/**
 * Revisar é IDEMPOTENTE: revisar de novo uma denúncia já revisada responde 200
 * com o MESMO reviewedAt (não regrava a data). O reload() traz o valor que o
 * banco realmente guardou (a data é arredondada em segundos), e é isso que
 * vai para a resposta e para a tela.
 */
async function reviewReport(id) {
  const report = await Report.findByPk(id);
  if (!report) {
    throw httpError(404, 'Denúncia não encontrada.');
  }

  if (report.status !== REPORT.STATUS.REVIEWED) {
    report.status = REPORT.STATUS.REVIEWED;
    report.reviewedAt = new Date();
    await report.save();
    await report.reload();
  }

  return { id: report.id, status: report.status, reviewedAt: report.reviewedAt };
}

async function getUsers(search, page, limit) {
  const offset = offsetOf(page, limit);
  let where = {};
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    where = {
      [Op.or]: [
        { username: { [Op.like]: pattern } },
        { email: { [Op.like]: pattern } },
        { fullName: { [Op.like]: pattern } }
      ]
    };
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    // Lista explícita: o password nunca sai, nem por descuido.
    attributes: [
      'id', 'username', 'email', 'fullName', 'profilePicture',
      'isBlocked', 'isAdmin', 'followersCount', 'followingCount', 'treinosCount', 'createdAt'
    ],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset
  });

  return {
    items: rows.map((user) => user.toJSON()),
    page,
    limit,
    total: count,
    hasMore: offset + rows.length < count
  };
}

/** Ordem dos erros: 404 (não existe) -> 400 (a si mesmo) -> 403 (outro admin). */
async function setUserBlocked(targetId, isBlocked, adminId) {
  const target = await User.findByPk(targetId);
  if (!target) {
    throw httpError(404, 'Usuário não encontrado.');
  }
  if (target.id === adminId) {
    throw httpError(400, 'Você não pode bloquear a sua própria conta.');
  }
  if (target.isAdmin) {
    throw httpError(403, 'Não é possível bloquear outro administrador.');
  }

  // Idempotente: só grava se mudar.
  if (target.isBlocked !== isBlocked) {
    target.isBlocked = isBlocked;
    await target.save();
  }

  return { id: target.id, username: target.username, isBlocked: target.isBlocked };
}

/**
 * Lista de treinos do painel. A contagem de denúncias pendentes NÃO vem de um
 * include agrupado (o GROUP BY num include com findAndCountAll bagunça o
 * count e o limit): são DUAS consultas — a página de treinos e, depois, uma
 * agrupada só com os ids dessa página — juntadas em memória com um Map.
 */
async function getWorkouts(search, page, limit) {
  const offset = offsetOf(page, limit);
  const where = search ? { title: { [Op.like]: `%${escapeLike(search)}%` } } : {};

  const { rows, count } = await Workout.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset
  });

  const pendingByWorkout = new Map();
  if (rows.length > 0) {
    const grouped = await Report.findAll({
      attributes: ['workoutId', [fn('COUNT', col('id')), 'total']],
      where: {
        workoutId: { [Op.in]: rows.map((workout) => workout.id) },
        status: REPORT.STATUS.PENDING
      },
      group: ['workout_id'],
      raw: true
    });
    grouped.forEach((row) => pendingByWorkout.set(row.workoutId, Number(row.total)));
  }

  return {
    items: rows.map((workout) => ({
      ...workoutService.toPublicWorkout(workout),
      pendingReportsCount: pendingByWorkout.get(workout.id) || 0
    })),
    page,
    limit,
    total: count,
    hasMore: offset + rows.length < count
  };
}

/** Sem destroy novo: reaproveita o deleteWorkout (último argumento = isAdmin). */
async function deleteWorkoutAsAdmin(workoutId, adminId) {
  await workoutService.deleteWorkout(workoutId, adminId, true);
}

module.exports = {
  getDashboardStats,
  getReports,
  reviewReport,
  getUsers,
  setUserBlocked,
  getWorkouts,
  deleteWorkoutAsAdmin
};
