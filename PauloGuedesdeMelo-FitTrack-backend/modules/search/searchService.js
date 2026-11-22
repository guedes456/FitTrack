const { Op } = require('sequelize');
const Workout = require('../workout/workoutModel');
const User = require('../user/userModel');
const { AUTHOR_ATTRIBUTES, toPublicWorkout } = require('../workout/workoutService');
const { SEARCH } = require('../../config/constants');
const escapeLike = require('../../utils/escapeLike');

/**
 * Camada de acesso a dados do módulo de busca (Aula 13): consulta o banco de
 * verdade por treinos e pessoas que combinem com o termo.
 */

async function searchWorkouts(query) {
  const workouts = await Workout.findAll({
    where: { title: { [Op.like]: `%${escapeLike(query)}%` } },
    // Só os atributos públicos do autor (nada de senha/e-mail).
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }],
    // id como desempate: mesma data (segundos) não pode trocar a ordem.
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit: SEARCH.LIMIT
  });
  return workouts.map(toPublicWorkout);
}

async function searchUsers(query) {
  const pattern = `%${escapeLike(query)}%`;
  const users = await User.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.like]: pattern } },
        { fullName: { [Op.like]: pattern } }
      ]
    },
    attributes: AUTHOR_ATTRIBUTES,
    order: [['username', 'ASC']],
    limit: SEARCH.LIMIT
  });
  return users.map((user) => user.toJSON());
}

// As duas consultas são independentes: rodam EM PARALELO (Promise.all), e a
// busca demora o tempo da mais lenta, não a soma das duas. Função solta, sem
// `this`: por isso o controller pode chamá-la direto.
async function globalSearch(query) {
  const [treinos, users] = await Promise.all([searchWorkouts(query), searchUsers(query)]);
  return { treinos, users };
}

module.exports = { searchWorkouts, searchUsers, globalSearch };
