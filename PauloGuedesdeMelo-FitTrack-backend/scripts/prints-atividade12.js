// Script para gerar os prints dos curls da Atividade 12 (Parte A).
// Roda no seu computador, com a API ligada (npm run dev em outro terminal):
//
//   node scripts/prints-atividade12.js paginacao   -> paginacao-antes/depois.jpg
//   node scripts/prints-atividade12.js transacao   -> criação + contador (Etapa 3)
//   node scripts/prints-atividade12.js regressao   -> bateria da Etapa 4
//   node scripts/prints-atividade12.js ids         -> ids inválidos (checkpoint-02.md)
//   node scripts/prints-atividade12.js             -> tudo, uma seção depois da outra
//
// Opcional: API_URL=http://localhost:3000/api node scripts/prints-atividade12.js
// Cria (se não existirem) duas contas de teste: prints_a e prints_b.

const BASE = process.env.API_URL || 'http://localhost:3000/api';
const PASSWORD = 'senha123';

const C = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m' };

// PNG 1x1 válido, só para ter um arquivo de imagem no upload.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

async function call(method, path, { token, json, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body });
  let data = null;
  try { data = await res.json(); } catch { /* sem corpo JSON */ }
  return { status: res.status, data };
}

// Mostra JSON legível: listas grandes viram "[N itens, ids: ...]".
function pretty(data) {
  const replacer = (key, value) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      const ids = value.map((v) => v.id).join(', ');
      return `[${value.length} item(ns); ids: ${ids}]`;
    }
    return value;
  };
  return JSON.stringify(data, replacer, 2);
}

let okCount = 0;
let failCount = 0;

async function step(label, method, path, expected, opts = {}) {
  const r = await call(method, path, opts);
  const ok = r.status === expected;
  ok ? okCount++ : failCount++;
  console.log(`\n${C.cyan}${C.bold}▶ ${method} ${path}${C.reset}${C.dim}  (${label})${C.reset}`);
  const mark = ok ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
  console.log(`  Status: ${r.status}   esperado: ${expected}  ${mark}`);
  console.log(pretty(r.data).split('\n').map((l) => '  ' + l).join('\n'));
  return r;
}

function title(text) {
  console.log(`\n${C.bold}${'═'.repeat(64)}\n ${text}\n${'═'.repeat(64)}${C.reset}`);
}

async function ensureUser(name) {
  const email = `${name}@teste.com`;
  await call('POST', '/register', {
    json: { username: name, email, password: PASSWORD, confirmPassword: PASSWORD, fullName: `Conta ${name}` },
  }); // 409 se já existe: tudo bem
  const r = await call('POST', '/login', { json: { email, password: PASSWORD } });
  if (r.status !== 200) {
    console.error(`${C.red}Não consegui logar ${name} (status ${r.status}). A API está rodando em ${BASE}?${C.reset}`);
    console.error(pretty(r.data));
    process.exit(1);
  }
  return { token: r.data.data.token, id: r.data.data.user.id, username: name };
}

async function uploadWorkout(token, titulo) {
  const form = new FormData();
  form.append('title', titulo);
  form.append('description', 'Treino criado pelo script de prints');
  form.append('image', new Blob([PNG], { type: 'image/png' }), 'treino.png');
  return call('POST', '/workouts', { token, form });
}

async function secPaginacao(A) {
  title('PAGINAÇÃO — feed geral e feed filtrado');
  const queries = ['?limit=-3', '?limit=100000', '?page=-2&limit=2'];
  for (const q of queries) await step('feed geral', 'GET', `/feed${q}`, 200, { token: A.token });
  for (const q of queries) await step('feed filtrado', 'GET', `/following-workouts${q}`, 200, { token: A.token });
  console.log(`\n${C.dim}Esperado DEPOIS da correção: limit=-3 -> limit 12 | limit=100000 -> limit 50 | page=-2&limit=2 -> page 1, limit 2${C.reset}`);
}

async function main() {
  const section = (process.argv[2] || 'tudo').toLowerCase();
  const valid = ['paginacao', 'transacao', 'regressao', 'ids', 'tudo'];
  if (!valid.includes(section)) {
    console.error(`Seção inválida. Use: ${valid.join(' | ')}`);
    process.exit(1);
  }

  const status = await call('GET', '/').catch(() => null);
  if (!status || status.status !== 200) {
    console.error(`${C.red}API fora do ar em ${BASE}. Rode "npm run dev" no backend primeiro.${C.reset}`);
    process.exit(1);
  }

  const A = await ensureUser('prints_a');
  const B = await ensureUser('prints_b');
  console.log(`${C.dim}Contas de teste prontas: ${A.username} (id ${A.id}) e ${B.username} (id ${B.id})${C.reset}`);

  if (section === 'paginacao' || section === 'tudo') await secPaginacao(A);

  if (section === 'transacao' || section === 'tudo') {
    title('TRANSAÇÃO — criar treino e conferir treinosCount');
    const antes = await step('contador ANTES', 'GET', '/profile/me', 200, { token: A.token });
    const r = await uploadWorkout(A.token, 'Treino da transação');
    const ok = r.status === 201;
    ok ? okCount++ : failCount++;
    console.log(`\n${C.cyan}${C.bold}▶ POST /workouts${C.reset}${C.dim}  (multipart: title + image)${C.reset}`);
    console.log(`  Status: ${r.status}   esperado: 201  ${ok ? C.green + '✓' : C.red + '✗'}${C.reset}`);
    console.log(pretty(r.data).split('\n').map((l) => '  ' + l).join('\n'));
    const depois = await step('contador DEPOIS', 'GET', '/profile/me', 200, { token: A.token });
    const a = antes.data?.data?.treinosCount;
    const d = depois.data?.data?.treinosCount;
    const subiu = d === a + 1;
    subiu ? okCount++ : failCount++;
    console.log(`\n  treinosCount: ${a} -> ${d}   ${subiu ? C.green + '✓ subiu em 1' : C.red + '✗ NÃO subiu em 1'}${C.reset}`);
  }

  if (section === 'regressao' || section === 'tudo') {
    title('REGRESSÃO DA API — Bloco 4');
    // Preparação (não aparece no print): B tem um treino, A começa sem seguir B e sem curtir.
    const up = await uploadWorkout(B.token, 'Treino do B para regressão');
    const workoutId = up.data?.data?.id;
    const pf = await call('GET', `/profile/${B.username}`, { token: A.token });
    if (pf.data?.data?.isFollowing) await call('POST', `/users/${B.id}/toggle-follow`, { token: A.token });
    const ls = await call('GET', `/workouts/${workoutId}/like-status`, { token: A.token });
    if (ls.data?.data?.liked) await call('POST', `/workouts/${workoutId}/toggle-like`, { token: A.token });

    await step('perfil, isFollowing=false', 'GET', `/profile/${B.username}`, 200, { token: A.token });
    await step('seguir', 'POST', `/users/${B.id}/toggle-follow`, 201, { token: A.token });
    await step('perfil, isFollowing=true', 'GET', `/profile/${B.username}`, 200, { token: A.token });
    await step('feed geral', 'GET', '/feed', 200, { token: A.token });
    await step('feed filtrado (só B)', 'GET', '/following-workouts', 200, { token: A.token });
    await step('seguidores do B', 'GET', `/users/${B.id}/followers`, 200);
    await step('curtir', 'POST', `/workouts/${workoutId}/toggle-like`, 201, { token: A.token });
    await step('treinos curtidos', 'GET', '/liked-workouts', 200, { token: A.token });
    await step('comentar', 'POST', `/workouts/${workoutId}/comments`, 201, { token: A.token, json: { content: 'Comentário da regressão' } });
    await step('comentários', 'GET', `/workouts/${workoutId}/comments`, 200);
    await step('meus itens (B)', 'GET', '/my-workouts', 200, { token: B.token });
  }

  if (section === 'ids' || section === 'tudo') {
    title('IDS INVÁLIDOS — leitura guiada (Bloco 2.5)');
    await step('treino id abc', 'GET', '/workouts/abc', 404);
    await step('treino id 0', 'GET', '/workouts/0', 404);
    await step('treino id -3', 'GET', '/workouts/-3', 404);
    await step('curtir id abc', 'POST', '/workouts/abc/toggle-like', 404, { token: A.token });
    await step('comentários id abc', 'GET', '/workouts/abc/comments', 404);
    await step('seguir id abc', 'POST', '/users/abc/toggle-follow', 400, { token: A.token });
  }

  console.log(`\n${C.bold}Resumo: ${C.green}${okCount} ok${C.reset}${C.bold}, ${failCount ? C.red : C.dim}${failCount} fora do esperado${C.reset}\n`);
}

main().catch((err) => {
  console.error(`${C.red}Erro inesperado:${C.reset}`, err.message);
  process.exit(1);
});
