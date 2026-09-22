const User = require('../modules/user/userModel');
const Workout = require('../modules/workout/workoutModel');

// Associações centralizadas num arquivo só, em vez de cada model importar o
// outro diretamente: se userModel.js importasse workoutModel.js e
// workoutModel.js importasse userModel.js de volta, teríamos uma referência
// circular entre os dois arquivos — dependendo da ordem de carregamento do
// Node, um dos dois receberia um module.exports ainda incompleto (`{}`).
// Aqui, os dois models já existem prontos antes de qualquer associação ser
// declarada, então não há essa corrida.
User.hasMany(Workout, { foreignKey: 'userId', as: 'workouts' });
Workout.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Workout };
