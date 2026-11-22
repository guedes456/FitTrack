// Promove (ou rebaixa) um usuário a administrador.
//
//   node scripts/setAdmin.js <username>        promove
//   node scripts/setAdmin.js <username> off    rebaixa
//
// Não existe rota da API para isso: se existisse, qualquer um que a
// alcançasse viraria administrador. Quem tem acesso ao servidor/banco
// (e portanto ao .env) é quem promove.
require('dotenv').config();

const sequelize = require('../config/database');
const User = require('../modules/user/userModel');

async function main() {
  const username = process.argv[2];
  const demote = process.argv[3] === 'off';

  if (!username) {
    console.error('Uso: node scripts/setAdmin.js <username> [off]');
    process.exitCode = 1;
    return;
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    console.error(`Usuário "${username}" não encontrado.`);
    process.exitCode = 1;
    return;
  }

  user.isAdmin = !demote;
  await user.save();
  console.log(`"${username}" agora ${demote ? 'NÃO é' : 'é'} administrador.`);
}

main()
  .catch((err) => {
    console.error('Erro:', err.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
