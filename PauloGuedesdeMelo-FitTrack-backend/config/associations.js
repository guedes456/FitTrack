const User = require('../modules/user/userModel');
const Workout = require('../modules/workout/workoutModel');
const Like = require('../modules/like/likeModel');
const Comment = require('../modules/comment/commentModel');
const Follow = require('../modules/follow/followModel');

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

// Seguir: Follow liga um usuário a OUTRO usuário — a mesma tabela (users)
// aparece duas vezes. Por isso cada associação precisa de um apelido (as):
// sem ele, o Sequelize não sabe qual das duas colunas (followerId ou
// followingId) o include deve usar, e as duas associações colidiriam.
//   Follower  = quem segue  (followerId)
//   Following = quem é seguido (followingId)
Follow.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'Following', foreignKey: 'followingId' });

module.exports = { User, Workout, Like, Comment, Follow };
