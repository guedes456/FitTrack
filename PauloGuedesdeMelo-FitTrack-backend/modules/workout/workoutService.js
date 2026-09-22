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

module.exports = { createWorkout };
