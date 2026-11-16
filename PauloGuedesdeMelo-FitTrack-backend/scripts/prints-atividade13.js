// Script para gerar os prints dos curls da Atividade 13 (Parte A, Etapa 6).
// Roda no seu computador, com a API ligada (npm run dev em outro terminal),
// DENTRO da pasta do backend:
//
//   node scripts/prints-atividade13.js criar       -> teste 1
//   node scripts/prints-atividade13.js listar      -> teste 2
//   node scripts/prints-atividade13.js adicionar   -> teste 3
//   node scripts/prints-atividade13.js remover     -> teste 4
//   node scripts/prints-atividade13.js ler         -> teste 5
//   node scripts/prints-atividade13.js status      -> teste 6
//   node scripts/prints-atividade13.js excluir     -> teste 7 (excluir rotina)
//   node scripts/prints-atividade13.js contador    -> teste 8 + Etapa 5 (contador-certo / contador-controle)
//   node scripts/prints-atividade13.js busca       -> teste 9
//   node scripts/prints-atividade13.js banco       -> teste 10 (colecoes-banco.jpg)
//   node scripts/prints-atividade13.js regressao   -> teste 11
//   node scripts/prints-atividade13.js             -> tudo
//
// Opcional: API_URL=http://localhost:3000/api node scripts/prints-atividade13.js
// Cria (se não existirem) duas contas de teste: prints13_a e prints13_b. Antes
// de cada rodada ele apaga as rotinas e os treinos DESSAS duas contas, para a
// saída ficar sempre limpa e do tamanho de uma tela.

const BASE = process.env.API_URL || 'http://localhost:3000/api';
const PASSWORD = 'senha123';
const C = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m' };

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

async function call(method, path, { token, json, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) {
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

// Deixa o JSON do tamanho de uma tela: treinos e pessoas viram uma linha.
function pretty(data) {
  const replacer = (key, value) => {
    if (Array.isArray(value) && value.length === 0) return value;
    if (Array.isArray(value) && typeof value[0] === 'object' && value[0] !== null) {
      return value.map((v) => {
        if ('title' in v && 'user' in v) return `#${v.id} "${v.title}" por @${v.user ? v.user.username : '?'}`;
        if ('username' in v) return `#${v.id} @${v.username} (${v.fullName})`;
        return v;
      });
    }
    return value;
  };
  return JSON.stringify(data, replacer, 2);
}

let okCount = 0;
let failCount = 0;

// check(data) devolve null (ok) ou um texto explicando o que NÃO bateu.
async function step(label, method, path, expected, opts = {}, check = null) {
  const r = await call(method, path, opts);
  let ok = r.status === expected;
  let note = '';
  if (ok && check) {
    const problem = check(r.data);
    if (problem) { ok = false; note = problem; }
  }
  ok ? okCount++ : failCount++;
  console.log(`\n${C.cyan}${C.bold}▶ ${method} ${path}${C.reset}${C.dim}  (${label})${C.reset}`);
  const mark = ok ? `${C.green}✓${C.reset}` : `${C.red}✗ ${note}${C.reset}`;
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
  });
  const r = await call('POST', '/login', { json: { email, password: PASSWORD } });
  if (r.status !== 200) {
    console.error(`${C.red}Não consegui logar ${name} (status ${r.status}). A API está rodando em ${BASE}?${C.reset}`);
    process.exit(1);
  }
  return { token: r.data.data.token, id: r.data.data.user.id, username: name };
}

async function uploadWorkout(token, titulo) {
  const form = new FormData();
  form.append('title', titulo);
  form.append('description', 'Treino criado pelo script de prints');
  form.append('image', new Blob([PNG], { type: 'image/png' }), 'treino.png');
  const r = await call('POST', '/workouts', { token, form });
  return r.data?.data?.id;
}

// Limpa o que sobrou de rodadas anteriores: só as ROTINAS (resetRoutines) ou
// rotinas + treinos (reset, usado uma vez no começo).
async function resetRoutines(...users) {
  for (const u of users) {
    const routines = (await call('GET', '/my-routines', { token: u.token })).data?.data || [];
    for (const r of routines) await call('DELETE', `/routines/${r.id}`, { token: u.token });
  }
}

async function reset(...users) {
  await resetRoutines(...users);
  for (const u of users) {
    const workouts = (await call('GET', '/my-workouts', { token: u.token })).data?.data || [];
    for (const w of workouts) await call('DELETE', `/workouts/${w.id}`, { token: u.token });
  }
}

async function newRoutine(token, titulo, isPublic) {
  const r = await call('POST', '/routines', { token, json: { title: titulo, isPublic } });
  return r.data?.data?.id;
}
const addTo = (token, routineId, workoutId) =>
  call('POST', `/routines/${routineId}/workouts`, { token, json: { workoutId } });

const has = (cond, msg) => (cond ? null : msg);

async function main() {
  const section = (process.argv[2] || 'tudo').toLowerCase();
  const valid = ['criar', 'listar', 'adicionar', 'remover', 'ler', 'status', 'excluir', 'contador', 'busca', 'banco', 'regressao', 'tudo'];
  if (!valid.includes(section)) {
    console.error(`Seção inválida. Use: ${valid.join(' | ')}`);
    process.exit(1);
  }
  const all = section === 'tudo';
  const run = (name) => all || section === name;

  const up = await call('GET', '/').catch(() => null);
  if (!up || up.status !== 200) {
    console.error(`${C.red}API fora do ar em ${BASE}. Rode "npm run dev" no backend primeiro.${C.reset}`);
    process.exit(1);
  }

  const A = await ensureUser('prints13_a');
  const B = await ensureUser('prints13_b');
  await reset(A, B);
  const WA = await uploadWorkout(A.token, 'Supino reto do A');
  const WB = await uploadWorkout(B.token, 'Agachamento do B');
  console.log(`${C.dim}Contas prontas: ${A.username} (id ${A.id}, treino ${WA}) e ${B.username} (id ${B.id}, treino ${WB})${C.reset}`);

  if (run('criar')) {
    title('1. CRIAR ROTINA');
    await step('sem token', 'POST', '/routines', 401, { json: { title: 'Rotina de pernas' } });
    await step('título curto "ab"', 'POST', '/routines', 400, { token: A.token, json: { title: 'ab' } });
    await step('só espaços', 'POST', '/routines', 400, { token: A.token, json: { title: '     ' } });
    await step('isPublic "sim"', 'POST', '/routines', 400, { token: A.token, json: { title: 'Rotina de pernas', isPublic: 'sim' } });
    await step('sem isPublic, título com espaços', 'POST', '/routines', 201, { token: A.token, json: { title: '  Rotina de pernas  ' } },
      (d) => has(d.data.isPublic === false && d.data.title === 'Rotina de pernas', 'isPublic deveria ser false e o título vir sem espaços'));
    await step('com isPublic: true', 'POST', '/routines', 201, { token: A.token, json: { title: 'Rotina pública', isPublic: true } },
      (d) => has(d.data.isPublic === true, 'isPublic deveria ser true'));
  }

  if (run('listar')) {
    await resetRoutines(A, B);
    title('2. LISTAR MINHAS ROTINAS (duas criadas em seguida)');
    await newRoutine(A.token, 'Rotina 1 (mais antiga)', false);
    await newRoutine(A.token, 'Rotina 2 (mais nova)', false);
    await newRoutine(B.token, 'Rotina do B', false);
    await step('conta A: só as dela, a mais nova primeiro', 'GET', '/my-routines', 200, { token: A.token },
      (d) => has(d.data.length === 2 && d.data[0].title.startsWith('Rotina 2'), 'ordem errada ou rotina de outra conta'));
    await step('conta B: só a dela', 'GET', '/my-routines', 200, { token: B.token },
      (d) => has(d.data.length === 1, 'deveria ter só 1'));
  }

  if (run('adicionar')) {
    await resetRoutines(A, B);
    title('3. ADICIONAR TREINO À ROTINA');
    const RA = await newRoutine(A.token, 'Rotina do A', false);
    const RB = await newRoutine(B.token, 'Rotina do B', false);
    await step('1ª vez', 'POST', `/routines/${RA}/workouts`, 201, { token: A.token, json: { workoutId: WA } },
      (d) => has(d.data.added === true && d.data.treinosCount === 1, 'added true e contador 1'));
    await step('repetido (idempotente)', 'POST', `/routines/${RA}/workouts`, 200, { token: A.token, json: { workoutId: WA } },
      (d) => has(d.data.added === false && d.data.treinosCount === 1, 'added false e contador AINDA 1'));
    await step('treino inexistente', 'POST', `/routines/${RA}/workouts`, 404, { token: A.token, json: { workoutId: 99999 } });
    await step('corpo sem o id', 'POST', `/routines/${RA}/workouts`, 400, { token: A.token, json: {} });
    await step('workoutId "abc"', 'POST', `/routines/${RA}/workouts`, 400, { token: A.token, json: { workoutId: 'abc' } });
    await step('rotina de outra pessoa', 'POST', `/routines/${RB}/workouts`, 403, { token: A.token, json: { workoutId: WA } });
    await step('rotina 99999', 'POST', '/routines/99999/workouts', 404, { token: A.token, json: { workoutId: WA } });
    await step('id "abc" na URL', 'POST', '/routines/abc/workouts', 400, { token: A.token, json: { workoutId: WA } });
  }

  if (run('remover')) {
    await resetRoutines(A, B);
    title('4. REMOVER TREINO DA ROTINA');
    const RA = await newRoutine(A.token, 'Rotina do A', false);
    const RB = await newRoutine(B.token, 'Rotina do B', false);
    await addTo(A.token, RA, WA);
    await addTo(A.token, RA, WB); // contador 2 (o treino do B é público)
    await step('remove (contador 2 -> 1)', 'DELETE', `/routines/${RA}/workouts/${WA}`, 200, { token: A.token },
      (d) => has(d.data.treinosCount === 1, 'contador deveria descer para 1'));
    await step('repetir (já saiu)', 'DELETE', `/routines/${RA}/workouts/${WA}`, 404, { token: A.token });
    await step('rotina de outra pessoa', 'DELETE', `/routines/${RB}/workouts/${WA}`, 403, { token: A.token });
  }

  if (run('ler')) {
    await resetRoutines(A, B);
    title('5. LER UMA ROTINA');
    const pub = await newRoutine(A.token, 'Rotina pública do A', true);
    const priv = await newRoutine(A.token, 'Rotina privada do A', false);
    await addTo(A.token, pub, WA);
    await addTo(A.token, pub, WB);
    await addTo(A.token, priv, WA);
    await step('pública, visitante', 'GET', `/routines/${pub}`, 200, {},
      (d) => has(d.data.isOwner === false && d.data.user && d.data.treinos.length === 2 && d.data.treinos[0].user, 'isOwner false, com autor da rotina e dos treinos'));
    await step('privada, a dona', 'GET', `/routines/${priv}`, 200, { token: A.token },
      (d) => has(d.data.isOwner === true, 'isOwner deveria ser true'));
    await step('privada, visitante', 'GET', `/routines/${priv}`, 403, {});
    await step('privada, outra conta', 'GET', `/routines/${priv}`, 403, { token: B.token });
    await step('rotina 99999', 'GET', '/routines/99999', 404, {});
    await step('id "abc"', 'GET', '/routines/abc', 400, {});
  }

  if (run('status')) {
    await resetRoutines(A, B);
    title('6. STATUS PARA O MODAL "SALVAR"');
    const R1 = await newRoutine(A.token, 'Com o treino', false);
    await newRoutine(A.token, 'Sem o treino', true);
    await newRoutine(B.token, 'Rotina do B', false);
    await addTo(A.token, R1, WA);
    await step('sem token', 'GET', `/workouts/${WA}/routines-status`, 401, {});
    await step('conta A', 'GET', `/workouts/${WA}/routines-status`, 200, { token: A.token },
      (d) => has(d.data.length === 2 && d.data.some((r) => r.hasWorkout) && d.data.some((r) => !r.hasWorkout), 'uma true e uma false'));
    await step('treino inexistente', 'GET', '/workouts/99999/routines-status', 404, { token: A.token });
    await step('conta B (só vê as dela, sem o treino)', 'GET', `/workouts/${WA}/routines-status`, 200, { token: B.token },
      (d) => has(d.data.length === 1 && d.data[0].hasWorkout === false, 'só a rotina do B, hasWorkout false'));
  }

  if (run('excluir')) {
    await resetRoutines(A, B);
    title('7. EXCLUIR A ROTINA');
    const RB = await newRoutine(B.token, 'Rotina do B', false);
    await addTo(B.token, RB, WB);
    await step('outra pessoa', 'DELETE', `/routines/${RB}`, 403, { token: A.token });
    await step('a dona', 'DELETE', `/routines/${RB}`, 200, { token: B.token });
    await step('de novo', 'DELETE', `/routines/${RB}`, 404, { token: B.token });
    await step('o treino continua existindo', 'GET', `/workouts/${WB}`, 200, {});
  }

  if (run('contador')) {
    await resetRoutines(A, B);
    title('8. EXCLUIR UM TREINO QUE ESTÁ NA ROTINA DE DUAS PESSOAS');
    const WX = await uploadWorkout(A.token, 'Treino que será excluído');
    const RA = await newRoutine(A.token, 'Rotina do A', false);
    const RB = await newRoutine(B.token, 'Rotina do B', false);
    await addTo(A.token, RA, WX);
    await addTo(B.token, RB, WX);
    await step('A ANTES (contador 1)', 'GET', '/my-routines', 200, { token: A.token });
    await step('B ANTES (contador 1)', 'GET', '/my-routines', 200, { token: B.token });
    await step('A exclui o treino', 'DELETE', `/workouts/${WX}`, 200, { token: A.token });
    await step('A DEPOIS (esperado: 0)', 'GET', '/my-routines', 200, { token: A.token },
      (d) => has(d.data[0].treinosCount === 0, `contador ficou ${d.data[0].treinosCount}: o bloco da Etapa 5 está comentado?`));
    await step('B DEPOIS (esperado: 0)', 'GET', '/my-routines', 200, { token: B.token },
      (d) => has(d.data[0].treinosCount === 0, `contador ficou ${d.data[0].treinosCount}: o bloco da Etapa 5 está comentado?`));
  }

  if (run('busca')) {
    title('9. BUSCA');
    const empty = (d) => has(d.data.treinos.length === 0 && d.data.users.length === 0, 'as duas listas deveriam estar vazias');
    await step('sem q', 'GET', '/search', 200, {}, empty);
    await step('q vazio', 'GET', '/search?q=', 200, {}, empty);
    await step('só espaços', 'GET', '/search?q=%20%20%20', 200, {}, empty);
    await step('1 letra', 'GET', '/search?q=s', 200, {}, empty);
    await step('trecho do título', 'GET', '/search?q=supino', 200, {},
      (d) => has(d.data.treinos.length === 1 && d.data.treinos[0].user, 'o treino, com o autor'));
    await step('outra caixa de letras', 'GET', '/search?q=SUPINO', 200, {},
      (d) => has(d.data.treinos.length === 1, 'o mesmo treino'));
    await step('trecho do username', 'GET', '/search?q=prints13_b', 200, {},
      (d) => has(d.data.users.length === 1 && !JSON.stringify(d.data).includes('password'), 'a pessoa, sem password'));
    await step('termo inexistente', 'GET', '/search?q=zzzxxyy', 200, {}, empty);
    await step('q repetido (?q=ab&q=cd)', 'GET', '/search?q=ab&q=cd', 200, {}, empty);
    await step('q como objeto (?q[x]=1)', 'GET', '/search?q[x]=1', 200, {}, empty);
    await step('%% literal', 'GET', '/search?q=%25%25', 200, {}, empty);
    await step('__ literal', 'GET', '/search?q=__', 200, {}, empty);
  }

  if (run('banco')) {
    title('10. BANCO: TABELAS, ÍNDICES, CASCADE E LINHA REPETIDA');
    const sequelize = require('../config/database');
    const show = async (sql) => {
      console.log(`\n${C.cyan}${C.bold}mysql> ${sql}${C.reset}`);
      const [rows] = await sequelize.query(sql);
      return rows;
    };
    console.log((await show('SHOW TABLES LIKE "routine%"')).map((r) => '  ' + Object.values(r)[0]).join('\n'));
    const idx = await show('SHOW INDEX FROM routine_workouts');
    console.log(idx.map((i) => `  ${i.Key_name}  (coluna ${i.Seq_in_index}: ${i.Column_name})  ${i.Non_unique ? '' : 'ÚNICO'}`).join('\n'));
    const [ct] = await show('SHOW CREATE TABLE routine_workouts');
    console.log(ct['Create Table'].split('\n').map((l) => '  ' + l).join('\n'));
    // Linha repetida direto no banco: ele precisa recusar.
    const RA = await newRoutine(A.token, 'Rotina para o teste do banco', false);
    await addTo(A.token, RA, WA);
    const sql = `INSERT INTO routine_workouts (routine_id, workout_id, created_at, updated_at) VALUES (${RA}, ${WA}, NOW(), NOW())`;
    console.log(`\n${C.cyan}${C.bold}mysql> ${sql}${C.reset}`);
    try {
      await sequelize.query(sql);
      failCount++;
      console.log(`  ${C.red}✗ o banco ACEITOU a linha repetida${C.reset}`);
    } catch (err) {
      okCount++;
      console.log(`  ${C.green}✓ recusada:${C.reset} ${err.original ? err.original.sqlMessage : err.message}`);
    }
    await sequelize.close();
  }

  if (run('regressao')) {
    await resetRoutines(A, B);
    title('11. REGRESSÃO');
    const WA2 = await uploadWorkout(A.token, 'Treino extra do A');
    await step('feed', 'GET', '/feed', 200, { token: A.token });
    await step('detalhe', 'GET', `/workouts/${WB}`, 200, { token: A.token });
    await step('perfil', 'GET', `/profile/${B.username}`, 200, { token: A.token });
    await step('curtir', 'POST', `/workouts/${WB}/toggle-like`, 201, { token: A.token });
    await step('comentar', 'POST', `/workouts/${WB}/comments`, 201, { token: A.token, json: { content: 'Regressão da Aula 13' } });
    await step('seguir', 'POST', `/users/${B.id}/toggle-follow`, 201, { token: A.token });
    await step('seguidores', 'GET', `/users/${B.id}/followers`, 200, {});
    await step('seguindo', 'GET', `/users/${A.id}/following`, 200, {});
    await step('feed "Seguindo"', 'GET', '/following-workouts', 200, { token: A.token });
    await step('curtidos', 'GET', '/liked-workouts', 200, { token: A.token });
    await step('meus treinos', 'GET', '/my-workouts', 200, { token: A.token });
    const form = new FormData();
    form.append('title', 'Treino extra editado');
    await step('edição', 'PUT', `/workouts/${WA2}`, 200, { token: A.token, form });
    await step('id inválido em /users/abc/followers', 'GET', '/users/abc/followers', 400, {},
      (d) => has(d.message === 'Identificador de usuário inválido.', 'mensagem do parseId'));
    // desfaz o que mexeu em estado, para a próxima rodada começar igual
    await call('POST', `/users/${B.id}/toggle-follow`, { token: A.token });
  }

  console.log(`\n${C.bold}Resumo: ${C.green}${okCount} ok${C.reset}${C.bold}, ${failCount ? C.red : C.dim}${failCount} fora do esperado${C.reset}\n`);
  process.exit(failCount ? 1 : 0);
}

main().catch((err) => {
  console.error(`${C.red}Erro inesperado:${C.reset}`, err.message);
  process.exit(1);
});
