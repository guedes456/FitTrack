// Gera notificações (curtir, comentar, seguir) para UMA conta sua, para o print
// lista-notificacoes.jpg. Com a API ligada, dentro da pasta do backend:
//
//   node scripts/gerar-notificacoes-aula14.js                    (conta teste@gmail.com)
//   node scripts/gerar-notificacoes-aula14.js outro@email.com    (outra conta)
//
// Como funciona: as contas de teste prints14_a e prints14_c (criadas se não
// existirem) curtem e comentam o seu treino MAIS RECENTE e a prints14_a segue
// você. No final, a notificação de curtida é marcada como LIDA, para a lista ter
// lidas e não lidas juntas. Precisa de ao menos um treino na conta alvo.
// Pode rodar de novo: ele refaz tudo e não duplica a curtida nem o "seguir".

const BASE = process.env.API_URL || 'http://localhost:3000/api';
const PASSWORD = 'senha123';
const EMAIL = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'teste@gmail.com';

async function call(method, path, { token, json } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
  const res = await fetch(`${BASE}${path}`, { method, headers, body });
  let data = null;
  try { data = await res.json(); } catch { /* sem corpo */ }
  return { status: res.status, data };
}

async function ensureUser(username) {
  const email = `${username}@teste.com`;
  await call('POST', '/register', { json: { username, email, password: PASSWORD, confirmPassword: PASSWORD, fullName: `Conta ${username}` } });
  const r = await call('POST', '/login', { json: { email, password: PASSWORD } });
  if (r.status !== 200) { console.error(`Não consegui logar ${username} (status ${r.status}).`); process.exit(1); }
  return { token: r.data.data.token, id: r.data.data.user.id, username };
}

async function main() {
  const up = await call('GET', '/').catch(() => null);
  if (!up || up.status !== 200) { console.error(`API fora do ar em ${BASE}. Rode "npm run dev" no backend.`); process.exit(1); }

  const sequelize = require('../config/database');
  const q = async (sql, replacements) => (await sequelize.query(sql, { replacements }))[0];

  const [target] = await q('SELECT id, username FROM users WHERE email = ?', [EMAIL]);
  if (!target) { console.error(`Não achei nenhuma conta com o e-mail ${EMAIL}.`); process.exit(1); }
  const [workout] = await q('SELECT id, title FROM workouts WHERE user_id = ? ORDER BY id DESC LIMIT 1', [target.id]);
  if (!workout) { console.error(`A conta ${target.username} não tem nenhum treino. Faça um Upload nela e rode de novo.`); process.exit(1); }

  const A = await ensureUser('prints14_a');
  const C = await ensureUser('prints14_c');

  // Recomeça limpo: sem avisos antigos dessas duas contas, e sem curtida/seguir de antes
  // (descurtir e deixar de seguir apagam o aviso; depois criamos de novo).
  await q('DELETE FROM notifications WHERE user_id = ? AND actor_id IN (?, ?)', [target.id, A.id, C.id]);
  const detail = (await call('GET', `/workouts/${workout.id}`, { token: A.token })).data?.data;
  if (detail?.isLiked) await call('POST', `/workouts/${workout.id}/toggle-like`, { token: A.token });
  const prof = (await call('GET', `/profile/${target.username}`, { token: A.token })).data?.data;
  if (prof?.isFollowing) await call('POST', `/users/${target.id}/toggle-follow`, { token: A.token });

  await call('POST', `/workouts/${workout.id}/toggle-like`, { token: A.token });                                   // curtir
  await call('POST', `/workouts/${workout.id}/comments`, { token: C.token, json: { content: 'Ótimo treino!' } }); // comentar (C)
  await call('POST', `/workouts/${workout.id}/comments`, { token: A.token, json: { content: 'Vou fazer também.' } }); // comentar (A)
  await call('POST', `/users/${target.id}/toggle-follow`, { token: A.token });                                      // seguir

  // A curtida (a mais antiga) vira LIDA: a lista fica com lidas e não lidas.
  await q("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND type = 'like' AND actor_id = ?", [target.id, A.id]);

  const rows = await q('SELECT type, is_read FROM notifications WHERE user_id = ? ORDER BY id DESC', [target.id]);
  console.log(`Notificações geradas para ${target.username} (${EMAIL}), no treino "${workout.title}":`);
  rows.forEach((r) => console.log(`  - ${r.type} · ${r.is_read ? 'LIDA' : 'não lida'}`));
  console.log('\nAgora entre no site com essa conta e abra o sino (use "Atualizar" se a tela já estava aberta).');
  await sequelize.close();
}

main().catch((err) => { console.error('Erro:', err.message); process.exit(1); });
