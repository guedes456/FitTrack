const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const Workout = require('./workoutModel');
const User = require('../user/userModel');
const Like = require('../like/likeModel');
const Comment = require('../comment/commentModel');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'workouts');

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

// Só estes campos do autor saem na API. Lista explícita (e não "tudo menos a
// senha") para que um campo novo no User nunca vaze sem alguém decidir isso.
const AUTHOR_ATTRIBUTES = ['id', 'username', 'fullName', 'profilePicture'];

function notFoundError() {
  const error = new Error('Treino não encontrado.');
  error.status = 404;
  return error;
}

function toPublicWorkout(workout) {
  return {
    id: workout.id,
    title: workout.title,
    description: workout.description,
    image: workout.image,
    viewsCount: workout.viewsCount,
    likesCount: workout.likesCount,
    commentsCount: workout.commentsCount,
    createdAt: workout.createdAt,
    user: workout.user
      ? {
          id: workout.user.id,
          username: workout.user.username,
          fullName: workout.user.fullName,
          profilePicture: workout.user.profilePicture
        }
      : null
  };
}

async function getWorkoutDetails(workoutId, viewerId) {
  const id = Number(workoutId);
  if (!Number.isInteger(id) || id < 1) {
    throw notFoundError();
  }

  const workout = await Workout.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }]
  });

  if (!workout) {
    throw notFoundError();
  }

  // increment() faz UPDATE views_count = views_count + 1 direto no banco
  // (atômico); depois o reload traz o valor real, inclusive se outra pessoa
  // abriu o mesmo treino ao mesmo tempo.
  await workout.increment('viewsCount', { by: 1 });
  await workout.reload();

  // Visitante anônimo nunca curtiu nada; para quem está logado, consulta a
  // tabela likes (a linha existe = curtiu).
  const isLiked = viewerId != null
    ? Boolean(await Like.findOne({ where: { userId: viewerId, workoutId: workout.id } }))
    : false;

  return {
    ...toPublicWorkout(workout),
    // viewerId vem do optionalAuth (null para visitante anônimo).
    isOwner: viewerId != null && viewerId === workout.userId,
    isLiked
  };
}

async function getFeedWorkouts({ page, limit }) {
  // page é "a página que o cliente quer" (1, 2, 3...); o banco só entende
  // "quantos registros pular". Página 1 pula 0, página 2 pula `limit`, etc.
  const offset = (page - 1) * limit;

  const { rows, count } = await Workout.findAndCountAll({
    include: [{ model: User, as: 'user', attributes: AUTHOR_ATTRIBUTES }],
    // id como desempate: dois treinos criados no mesmo segundo não podem
    // trocar de página entre uma requisição e outra.
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset
  });

  return {
    items: rows.map(toPublicWorkout),
    page,
    limit,
    total: count,
    hasMore: offset + rows.length < count
  };
}

// Apaga um arquivo de treino do disco SEM nunca derrubar a requisição: quando
// isto roda, o banco já foi atualizado e a resposta ao usuário já é de
// sucesso. Se a remoção falhar, o pior caso é um arquivo sobrando em disco
// (órfão), nunca um registro apontando para um arquivo que sumiu.
async function removeWorkoutFile(fileName) {
  if (!fileName) return;
  try {
    await fs.promises.unlink(path.join(UPLOAD_DIR, fileName));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Não foi possível remover o arquivo do treino:', err.message);
    }
  }
}

// Busca o treino e confere o dono. A ORDEM importa: primeiro "existe?"
// (404), depois "é seu?" (403). Se a ordem fosse inversa, qualquer pessoa
// receberia 403 para ids inexistentes e 404 para ids reais de outros
// usuários, o que revelaria quais ids existem. Na ordem certa, 404 vale
// para todo mundo e 403 só aparece quando o treino realmente existe.
async function findOwnedWorkout(workoutId, userId) {
  const id = Number(workoutId);
  if (!Number.isInteger(id) || id < 1) {
    throw notFoundError();
  }

  const workout = await Workout.findByPk(id);
  if (!workout) {
    throw notFoundError();
  }

  if (workout.userId !== userId) {
    const error = new Error('Você não tem permissão para alterar este treino.');
    error.status = 403;
    throw error;
  }

  return workout;
}

async function getMyWorkouts(userId) {
  const workouts = await Workout.findAll({
    where: { userId },
    order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });
  return workouts.map(toPublicWorkout);
}

// Dados para pré-preencher o formulário de edição. Não passa por
// getWorkoutDetails de propósito: abrir o formulário de edição não é uma
// "visualização" e não deve mexer na contagem.
async function getWorkoutForEdit(workoutId, userId) {
  const workout = await findOwnedWorkout(workoutId, userId);
  return {
    id: workout.id,
    title: workout.title,
    description: workout.description,
    image: workout.image
  };
}

async function updateWorkout(workoutId, userId, { title, description }, newFileName) {
  const workout = await findOwnedWorkout(workoutId, userId);
  const previousImage = workout.image;

  workout.title = title;
  workout.description = description || null;
  if (newFileName) {
    workout.image = newFileName;
  }
  await workout.save();

  // Banco ANTES do disco: com o registro já apontando para a imagem nova, o
  // arquivo antigo não é mais usado por ninguém e pode ser apagado. Na ordem
  // inversa (apagar primeiro), um erro no save() deixaria o banco apontando
  // para um arquivo que já não existe (imagem quebrada).
  if (newFileName && previousImage && previousImage !== newFileName) {
    await removeWorkoutFile(previousImage);
  }

  return {
    id: workout.id,
    title: workout.title,
    description: workout.description,
    image: workout.image,
    viewsCount: workout.viewsCount,
    likesCount: workout.likesCount,
    commentsCount: workout.commentsCount,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt
  };
}

async function deleteWorkout(workoutId, userId) {
  const workout = await findOwnedWorkout(workoutId, userId);
  const fileName = workout.image;

  // Registro e contador mudam juntos, numa transação: ou os dois acontecem,
  // ou nenhum. O contador nunca fica abaixo de zero.
  await sequelize.transaction(async (transaction) => {
    // Curtidas e comentários do treino saem junto, na MESMA transação. Todo
    // comando recebe { transaction }: sem isso ele rodaria numa conexão
    // separada, fora da transação, e não seria desfeito se algo falhasse
    // adiante.
    await Like.destroy({ where: { workoutId: workout.id }, transaction });
    await Comment.destroy({ where: { workoutId: workout.id }, transaction });
    await workout.destroy({ transaction });
    await User.decrement('treinosCount', {
      by: 1,
      where: { id: userId, treinosCount: { [Op.gt]: 0 } },
      transaction
    });
  });

  // Só depois do banco: se o disco falhar, sobra um arquivo (órfão), mas o
  // treino já foi excluído de verdade e ninguém vê imagem quebrada.
  await removeWorkoutFile(fileName);
}

module.exports = {
  AUTHOR_ATTRIBUTES,
  toPublicWorkout,
  createWorkout,
  getWorkoutDetails,
  getFeedWorkouts,
  getMyWorkouts,
  getWorkoutForEdit,
  updateWorkout,
  deleteWorkout
};
