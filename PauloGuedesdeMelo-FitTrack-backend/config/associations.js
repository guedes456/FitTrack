const User = require('../modules/user/userModel');
const Workout = require('../modules/workout/workoutModel');
const Like = require('../modules/like/likeModel');
const Comment = require('../modules/comment/commentModel');
const Follow = require('../modules/follow/followModel');
const Routine = require('../modules/routine/routineModel');
const RoutineWorkout = require('../modules/routine/routineWorkoutModel');
const Notification = require('../modules/notification/notificationModel');
const Report = require('../modules/report/reportModel');

// Associações centralizadas num arquivo só, em vez de cada model importar o
// outro diretamente: se userModel.js importasse workoutModel.js e
// workoutModel.js importasse userModel.js de volta, teríamos uma referência
// circular entre os dois arquivos — dependendo da ordem de carregamento do
// Node, um dos dois receberia um module.exports ainda incompleto (`{}`).
// Aqui, os models já existem prontos antes de qualquer associação ser
// declarada, então não há essa corrida.
User.hasMany(Workout, { foreignKey: 'userId', as: 'workouts' });
Workout.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Curtidas: Like liga um usuário a um treino. As associações nos DOIS
// sentidos (hasMany + belongsTo) permitem consultar tanto "quem curtiu este
// treino" quanto "o que este usuário curtiu", e usar include nos dois lados.
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Workout.hasMany(Like, { foreignKey: 'workoutId', as: 'likes' });
Like.belongsTo(Workout, { foreignKey: 'workoutId', as: 'workout' });

// Comentários: mesma ideia.
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Workout.hasMany(Comment, { foreignKey: 'workoutId', as: 'comments' });
Comment.belongsTo(Workout, { foreignKey: 'workoutId', as: 'workout' });

// Seguir: a tabela follows liga a MESMA tabela (users) DUAS vezes, uma por
// coluna. O Sequelize não tem como adivinhar qual User é qual, então cada
// associação precisa de um apelido (as) e da sua chave estrangeira:
//   Follower  -> followerId  (quem segue)
//   Following -> followingId (quem é seguido)
// Para ler em voz alta: "os SEGUIDORES de X" são as linhas onde followingId = X
// (e o include traz o Follower); "quem X SEGUE" são as linhas onde
// followerId = X (e o include traz o Following).
Follow.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'Following', foreignKey: 'followingId' });

// Rotinas (Aula 13): User 1-N Routine, e Routine N-N Workout através de
// RoutineWorkout. São SEIS associações: duas para ligar o usuário à rotina
// e, para cada lado da junção (rotina e treino), um hasMany + um belongsTo.
// onDelete CASCADE: o banco apaga as linhas da junção quando a rotina ou o
// treino some — mas NÃO ajusta o treinosCount das rotinas (ver deleteWorkout).
User.hasMany(Routine, { foreignKey: 'userId', as: 'routines' });
Routine.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Routine.hasMany(RoutineWorkout, { foreignKey: 'routineId', as: 'links', onDelete: 'CASCADE' });
RoutineWorkout.belongsTo(Routine, { foreignKey: 'routineId', as: 'routine' });
Workout.hasMany(RoutineWorkout, { foreignKey: 'workoutId', as: 'routineLinks', onDelete: 'CASCADE' });
RoutineWorkout.belongsTo(Workout, { foreignKey: 'workoutId', as: 'workout' });

// Notificações e denúncias (Aula 14): SÓ o sentido belongsTo, de propósito. É a
// belongsTo que cria a chave estrangeira e escolhe o ON DELETE:
//   - Notification.workoutId aceita NULL  -> ON DELETE SET NULL
//   - Report.workoutId é NOT NULL         -> ON DELETE NO ACTION (recusa)
// Cinco associações: a notificação tem dois usuários (Recipient e Actor, a
// mesma tabela duas vezes) e um treino; a denúncia, um usuário (Reporter) e um
// treino.
Notification.belongsTo(User, { foreignKey: 'userId', as: 'Recipient' });
Notification.belongsTo(User, { foreignKey: 'actorId', as: 'Actor' });
Notification.belongsTo(Workout, { foreignKey: 'workoutId', as: 'Workout' });
Report.belongsTo(User, { foreignKey: 'userId', as: 'Reporter' });
Report.belongsTo(Workout, { foreignKey: 'workoutId', as: 'Workout' });

module.exports = { User, Workout, Like, Comment, Follow, Routine, RoutineWorkout, Notification, Report };
