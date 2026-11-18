// Prepara os DADOS para os prints do navegador da Atividade 13.
// Com a API ligada, dentro da pasta do backend:
//
//   node scripts/preparar-prints-aula13.js
//
// Cria/zera as contas de teste prints13_a e prints13_b (as mesmas do script de
// curls), um treino em cada, duas rotinas para a conta A (uma privada com treino
// e uma pública vazia) e uma pessoa chamada "supino_fan", para a busca por
// "supino" trazer TREINOS e PESSOAS. No final, imprime o login e os links.

const BASE = process.env.API_URL || 'http://localhost:3000/api';
const FRONT = process.env.FRONT_URL || 'http://localhost:5173';
const PASSWORD = 'senha123';
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

async function call(method, path, { token, json, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
  else if (form) body = form;
  const res = await fetch(`${BASE}${path}`, { method, headers, body });
  let data = null;
  try { data = await res.json(); } catch { /* sem corpo */ }
  return { status: res.status, data };
}

async function ensureUser(username, fullName) {
  const email = `${username}@teste.com`;
  await call('POST', '/register', { json: { username, email, password: PASSWORD, confirmPassword: PASSWORD, fullName } });
  const r = await call('POST', '/login', { json: { email, password: PASSWORD } });
  if (r.status !== 200) {
    console.error(`Não consegui logar ${username} (status ${r.status}). A API está rodando em ${BASE}?`);
    process.exit(1);
  }
  return { token: r.data.data.token, id: r.data.data.user.id, username, email };
}

async function upload(token, title) {
  const form = new FormData();
  form.append('title', title);
  form.append('description', 'Treino de demonstração');
  form.append('image', new Blob([PNG], { type: 'image/png' }), 'treino.png');
  return (await call('POST', '/workouts', { token, form })).data?.data?.id;
}

async function main() {
  const up = await call('GET', '/').catch(() => null);
  if (!up || up.status !== 200) { console.error(`API fora do ar em ${BASE}. Rode "npm run dev" no backend.`); process.exit(1); }

  const A = await ensureUser('prints13_a', 'Conta prints13_a');
  const B = await ensureUser('prints13_b', 'Conta prints13_b');
  await ensureUser('supino_fan', 'Fã de Supino');

  // zera o que as rodadas anteriores deixaram nas duas contas de teste
  for (const u of [A, B]) {
    for (const r of (await call('GET', '/my-routines', { token: u.token })).data?.data || []) await call('DELETE', `/routines/${r.id}`, { token: u.token });
    for (const w of (await call('GET', '/my-workouts', { token: u.token })).data?.data || []) await call('DELETE', `/workouts/${w.id}`, { token: u.token });
  }

  const WA = await upload(A.token, 'Supino reto do A');
  const WB = await upload(B.token, 'Supino inclinado do B');

  const priv = (await call('POST', '/routines', { token: A.token, json: { title: 'Rotina privada de peito', isPublic: false } })).data.data.id;
  const pub = (await call('POST', '/routines', { token: A.token, json: { title: 'Rotina pública', isPublic: true } })).data.data.id;
  await call('POST', `/routines/${priv}/workouts`, { token: A.token, json: { workoutId: WB } });

  console.log(`
Dados prontos. Entre no site com a conta A:

  e-mail: ${A.email}
  senha:  ${PASSWORD}

Links úteis (o treino ${WB} é do B e já está na rotina privada; o ${WA} é do A):
  Treino para o modal "Salvar":   ${FRONT}/treinos/${WB}
  Minhas Rotinas:                 ${FRONT}/minhas-rotinas
  Rotina PRIVADA (A):             ${FRONT}/rotinas/${priv}   <- abra numa janela anônima (print do visitante)
  Rotina PÚBLICA (A):             ${FRONT}/rotinas/${pub}
  Busca (treinos E pessoas):      ${FRONT}/busca?q=supino

Situação do modal "Salvar" no treino ${WB}: "Rotina privada de peito" já MARCADA (com cadeado)
e "Rotina pública" NÃO marcada.
`);
}

main().catch((err) => { console.error('Erro inesperado:', err.message); process.exit(1); });
