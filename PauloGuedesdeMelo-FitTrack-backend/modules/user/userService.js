const User = require('./userModel');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { generateToken } = require('../../config/jwt');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'profiles');

async function registerUser(username, email, password, fullName) {
  const emailExists = await User.findOne({ where: { email } });
  const usernameExists = await User.findOne({ where: { username } });

  if (emailExists || usernameExists) {
    throw new Error('Este e-mail ou usuário já está cadastrado.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    fullName
  });

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email
  };
}

async function loginUser(email, password) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    // Mensagem genérica de propósito: nunca revelar se foi o e-mail ou a senha
    // que estava errada, para não ajudar quem está tentando adivinhar contas.
    throw new Error('E-mail ou senha inválidos.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new Error('E-mail ou senha inválidos.');
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin
    }
  };
}

async function getUserProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'email', 'fullName', 'bio', 'profilePicture', 'followersCount', 'followingCount', 'treinosCount', 'isAdmin']
  });

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  return user;
}

async function getPublicProfile(username) {
  const user = await User.findOne({
    where: { username },
    attributes: ['id', 'username', 'fullName', 'bio', 'profilePicture', 'followersCount', 'followingCount', 'treinosCount']
  });

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  return user;
}

async function updateUserProfile(userId, { fullName, bio }, newFileName) {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  const previousPicture = user.profilePicture;

  user.fullName = fullName;
  user.bio = bio || null;

  if (newFileName) {
    user.profilePicture = newFileName;
  }

  await user.save();

  // Só apaga a foto antiga se: (a) uma foto nova foi enviada, e (b) a antiga
  // não é a padrão — nunca queremos apagar o default-profile.png do disco,
  // já que ele é compartilhado por todo mundo que ainda não trocou de foto.
  if (newFileName && previousPicture && previousPicture !== 'default-profile.png') {
    const oldPath = path.join(UPLOAD_DIR, previousPicture);
    fs.unlink(oldPath, (err) => {
      if (err) {
        // Não interrompe a resposta por causa disso — o cadastro já foi
        // atualizado com sucesso; só registramos que a limpeza falhou.
        console.error('Não foi possível remover a foto antiga:', err.message);
      }
    });
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    bio: user.bio,
    profilePicture: user.profilePicture
  };
}

module.exports = { registerUser, loginUser, getUserProfile, getPublicProfile, updateUserProfile };
