// Script para gerar os prints dos curls da Atividade 14 (Parte A, Etapa 5).
// Roda no seu computador, com a API ligada (npm run dev em outro terminal),
// DENTRO da pasta do backend:
//
//   node scripts/prints-atividade14.js semtoken   -> teste 1
//   node scripts/prints-atividade14.js curtir     -> teste 2
//   node scripts/prints-atividade14.js comentar   -> teste 3
//   node scripts/prints-atividade14.js seguir     -> teste 4
//   node scripts/prints-atividade14.js lista      -> teste 5
//   node scripts/prints-atividade14.js lida       -> teste 6
//   node scripts/prints-atividade14.js denuncia   -> teste 7
//   node scripts/prints-atividade14.js banco      -> teste 8 (banco-notificacoes.jpg)
//   node scripts/prints-atividade14.js excluir    -> teste 9
//   node scripts/prints-atividade14.js logout     -> teste 10
//   node scripts/prints-atividade14.js regressao  -> teste 11
//   node scripts/prints-atividade14.js            -> tudo
// Testes de controle (use o wrapper scripts/controle-aula14.js, que comenta o código):
//   node scripts/controle-aula14.js reports | orfa
//
// MODO RELATÓRIO (tudo de uma vez, sem rolar o terminal):
//   node scripts/prints-atividade14.js tudo --html
// gera o arquivo relatorio-atividade14.html (nesta pasta). Abra-o no navegador
// (duplo clique), navegue com as setas e tire um print de cada tela.
//
// Opcional: API_URL=http://localhost:3000/api node scripts/prints-atividade13.js
// Cria (se não existirem) três contas de teste: prints14_a, prints14_b e
// prints14_c (A age, B é a dona do treino, C é uma terceira pessoa). Antes de
// cada teste ele zera as rotinas, os treinos, os seguidores e as notificações
// DESSAS contas, para a saída ficar sempre limpa e do tamanho de uma tela.

const HTML = process.argv.includes('--html');
const SECTION_ARG = process.argv.slice(2).find((a) => !a.startsWith('--'));
const BASE = process.env.API_URL || 'http://localhost:3000/api';
const PASSWORD = 'senha123';
const C = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m' };

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);


// ---------- Modo relatório (--html): captura a saída em vez de imprimir ----------
const sections = [];
const realLog = console.log;
const stripAnsi = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');

function startSection(name) {
  sections.push({ name, steps: [] });
}
function startStep() {
  if (sections.length === 0) startSection('Preparação');
  sections[sections.length - 1].steps.push({ lines: [] });
}
if (HTML) {
  console.log = (...args) => {
    const text = args.join(' ');
    const firstLine = stripAnsi(text).replace(/^\n+/, '').split('\n')[0];
    const isSeparator = /^═+$/.test(firstLine.trim());
    if (isSeparator) return; // as barras ═ do título não entram: o relatório tem o seu
    const begins = firstLine.startsWith('▶') || firstLine.startsWith('mysql>') || firstLine.startsWith('Resumo');
    if (sections.length === 0) startSection('Preparação');
    const current = sections[sections.length - 1];
    if (begins || current.steps.length === 0) startStep();
    current.steps[current.steps.length - 1].lines.push(text.replace(/^\n+/, ''));
  };
}

function ansiToHtml(text) {
  const map = { '32': 'g', '31': 'r', '36': 'c', '2': 'd', '1': 'b' };
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let open = 0;
  const out = esc.replace(/\x1b\[([0-9;]*)m/g, (_, code) => {
    if (code === '0' || code === '') { const close = '</span>'.repeat(open); open = 0; return close; }
    open++;
    return `<span class="${map[code] || 'x'}">`;
  });
  return out + '</span>'.repeat(open);
}

function writeReport() {
  const fs = require('fs');
  const path = require('path');
  const tests = sections.filter((sec) => sec.name !== 'Preparação' && sec.steps.length > 0);
  const body = tests.map((sec, i) => `
<section class="test" data-title="${sec.name.replace(/"/g, '&quot;')}">
  <h2>${i + 1}/${tests.length} · ${sec.name.replace(/&/g, '&amp;')}</h2>
  ${sec.steps.map((st) => `<pre class="step">${ansiToHtml(st.lines.join('\n'))}</pre>`).join('\n  ')}
</section>`).join('\n');

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Relatório da Atividade 14</title>
<style>
  body{margin:0;background:#1b1d1f;color:#d8dadc;font:15px/1.45 Consolas,"Cascadia Mono",monospace}
  #bar{position:sticky;top:0;background:#0f1011;padding:8px 14px;display:flex;gap:8px;align-items:center;border-bottom:1px solid #333;z-index:5}
  #bar button{background:#2b2d30;color:#eee;border:1px solid #555;border-radius:6px;padding:4px 10px;cursor:pointer;font:inherit}
  #bar span{color:#999;margin-left:auto}
  main{max-width:860px;margin:0 auto;padding:14px 18px}
  h2{font-size:15px;margin:0 0 10px;padding:6px 0;border-bottom:2px solid #444;color:#fff}
  pre.step{margin:0 0 12px;white-space:pre-wrap;word-break:break-word}
  .test{display:none}.test.on{display:block}
  .single .step{display:none}.single .step.on{display:block}
  .g{color:#3fb950}.r{color:#f85149}.c{color:#58a6ff}.d{color:#8b949e}.b{font-weight:700}
  .hide #bar{display:none}
</style></head>
<body>
<div id="bar">
  <button id="prev">◀ Anterior</button><button id="next">Próximo ▶</button>
  <button id="mode">Modo: um teste por tela</button>
  <button id="hidebar">Ocultar barra (H)</button>
  <span id="pos"></span>
</div>
<main id="main">${body}</main>
<script>
  const tests = [...document.querySelectorAll('.test')];
  const main = document.getElementById('main');
  let t = 0, s = 0, single = false;
  function steps(){ return [...tests[t].querySelectorAll('.step')]; }
  function render(){
    tests.forEach((el,i)=>el.classList.toggle('on', i===t));
    main.classList.toggle('single', single);
    steps().forEach((el,i)=>el.classList.toggle('on', i===s));
    document.getElementById('pos').textContent =
      'Teste ' + (t+1) + '/' + tests.length + (single ? ' · curl ' + (s+1) + '/' + steps().length : '');
    document.getElementById('mode').textContent = 'Modo: ' + (single ? 'um curl por tela' : 'um teste por tela');
    window.scrollTo(0,0);
  }
  function next(){ if (single && s < steps().length-1) { s++; } else if (t < tests.length-1) { t++; s=0; } render(); }
  function prev(){ if (single && s > 0) { s--; } else if (t > 0) { t--; s = single ? steps().length-1 : 0; } render(); }
  document.getElementById('next').onclick = next;
  document.getElementById('prev').onclick = prev;
  document.getElementById('mode').onclick = () => { single = !single; s = 0; render(); };
  const toggleBar = () => document.body.classList.toggle('hide');
  document.getElementById('hidebar').onclick = toggleBar;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key.toLowerCase() === 'h') toggleBar();
    else if (e.key.toLowerCase() === 'm') { single = !single; s = 0; render(); }
  });
  render();
</script></body></html>`;
  const file = path.join(process.cwd(), 'relatorio-atividade14.html');
  fs.writeFileSync(file, html);
  realLog(`\nRelatório gerado: ${file}\nAbra no navegador (duplo clique). Setas ← → navegam; H oculta a barra; M troca entre "um teste por tela" e "um curl por tela".`);
}

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
        if ('type' in v && 'isRead' in v && 'actor' in v) {
          const alvo = v.workout ? ` “${v.workout.title}”` : '';
          return `#${v.id} [${v.type}] @${v.actor ? v.actor.username : '?'}${alvo} · ${v.isRead ? 'lida' : 'NÃO lida'}`;
        }
        // Rotina (lista "minhas rotinas"): mostra o CONTADOR, que é o que os testes conferem.
        if ('isPublic' in v && 'treinosCount' in v && !('hasWorkout' in v)) {
          const n = v.treinosCount;
          return `#${v.id} “${v.title}” · ${v.isPublic ? 'pública' : 'privada'} · treinosCount: ${n}`;
        }
        if ('title' in v && 'user' in v) return `#${v.id} “${v.title}” por @${v.user ? v.user.username : '?'}`;
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
  if (HTML) startSection(text.replace(/^\d+\.\s*/, '').trim());
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


// ---------------- helpers da Atividade 14 ----------------
let sequelizeInstance = null;
function db() {
  if (!sequelizeInstance) sequelizeInstance = require('../config/database');
  return sequelizeInstance;
}
const sql = async (query) => (await db().query(query))[0];

const has = (cond, msg) => (cond ? null : msg);
const like = (token, id) => call('POST', `/workouts/${id}/toggle-like`, { token });
const unread = async (token) => (await call('GET', '/notifications/unread-count', { token })).data?.data?.unreadCount;
const list = async (token, qs = '') => (await call('GET', `/notifications${qs}`, { token })).data?.data;

// Zera tudo das três contas (rotinas, treinos, seguidores, notificações) e cria
// um treino para cada uma: WA, WB, WC.
async function prepare() {
  const A = await ensureUser('prints14_a');
  const B = await ensureUser('prints14_b');
  const Cc = await ensureUser('prints14_c'); // (C é o objeto de cores neste arquivo)
  await reset(A, B, Cc); // rotinas e treinos (a API apaga curtidas, comentários, denúncias e avisos deles)
  const ids = [A.id, B.id, Cc.id].join(',');
  await sql(`DELETE FROM notifications WHERE user_id IN (${ids}) OR actor_id IN (${ids})`);
  await sql(`DELETE FROM follows WHERE follower_id IN (${ids}) OR following_id IN (${ids})`);
  await sql(`UPDATE users SET followers_count = 0, following_count = 0 WHERE id IN (${ids})`);
  const WA = await uploadWorkout(A.token, 'Treino do A');
  const WB = await uploadWorkout(B.token, 'Treino do B');
  const WC = await uploadWorkout(Cc.token, 'Treino do C');
  // No relatório HTML o aviso de preparação não aparece (ia parar no rodapé do teste anterior).
  if (!HTML) console.log(`${C.dim}Contas prontas: A=${A.id} B=${B.id} C=${Cc.id} · treinos A=${WA} B=${WB} C=${WC}${C.reset}`);
  return { A, B, C: Cc, WA, WB, WC };
}

async function main() {
  const section = (SECTION_ARG || 'tudo').toLowerCase();
  const valid = ['semtoken', 'curtir', 'comentar', 'seguir', 'lista', 'lida', 'denuncia', 'banco', 'excluir', 'logout', 'regressao', 'controle-reports', 'controle-orfa', 'tudo'];
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

  if (run('semtoken')) {
    title('1. SEM TOKEN: AS QUATRO ROTAS RESPONDEM 401');
    await step('lista', 'GET', '/notifications', 401, {});
    await step('contador', 'GET', '/notifications/unread-count', 401, {});
    await step('marcar como lida', 'PATCH', '/notifications/1/read', 401, {});
    await step('denunciar', 'POST', '/workouts/1/report', 401, { json: { reason: 'spam' } });
  }

  if (run('curtir')) {
    const { A, B, WA, WB } = await prepare();
    title('2. CURTIR GERA O AVISO (E DESCURTIR APAGA)');
    await step('B: não lidas = 0', 'GET', '/notifications/unread-count', 200, { token: B.token }, (d) => has(d.data.unreadCount === 0, 'esperado 0'));
    await step('A curte o treino do B', 'POST', `/workouts/${WB}/toggle-like`, 201, { token: A.token });
    await step('B: não lidas = 1', 'GET', '/notifications/unread-count', 200, { token: B.token }, (d) => has(d.data.unreadCount === 1, 'esperado 1'));
    await step('B: a lista traz o aviso com Actor e o treino', 'GET', '/notifications', 200, { token: B.token },
      (d) => {
        const n = d.data.items[0];
        const raw = JSON.stringify(d.data.items[0]);
        return has(d.data.items.length === 1 && n.type === 'like' && n.actor.username === 'prints14_a' && n.workout.title === 'Treino do B' && !/password|email|isAdmin/i.test(raw), 'um aviso like, com actor e treino, sem dados privados');
      });
    await step('A descurte: apaga o aviso', 'POST', `/workouts/${WB}/toggle-like`, 200, { token: A.token });
    await step('B: não lidas = 0 de novo', 'GET', '/notifications/unread-count', 200, { token: B.token }, (d) => has(d.data.unreadCount === 0, 'esperado 0'));
    await like(A.token, WB);
    await step('A curte de novo: uma só (não duplica)', 'GET', '/notifications', 200, { token: B.token }, (d) => has(d.data.total === 1, 'esperado total 1'));
    await step('A curte o PRÓPRIO treino', 'POST', `/workouts/${WA}/toggle-like`, 201, { token: A.token });
    await step('A: continua com 0 não lidas', 'GET', '/notifications/unread-count', 200, { token: A.token }, (d) => has(d.data.unreadCount === 0, 'esperado 0'));
  }

  if (run('comentar')) {
    const { B, C, WB } = await prepare();
    title('3. COMENTAR GERA O AVISO (O DONO COMENTANDO NÃO)');
    await step('C comenta no treino do B', 'POST', `/workouts/${WB}/comments`, 201, { token: C.token, json: { content: 'Bom treino!' } });
    await step('B: um aviso de comentário', 'GET', '/notifications', 200, { token: B.token }, (d) => has(d.data.total === 1 && d.data.items[0].type === 'comment', 'um aviso comment'));
    await step('B comenta no PRÓPRIO treino', 'POST', `/workouts/${WB}/comments`, 201, { token: B.token, json: { content: 'Obrigado!' } });
    await step('B: continua com 1 não lida', 'GET', '/notifications/unread-count', 200, { token: B.token }, (d) => has(d.data.unreadCount === 1, 'esperado 1'));
  }

  if (run('seguir')) {
    const { A, B } = await prepare();
    title('4. SEGUIR GERA O AVISO (DEIXAR DE SEGUIR APAGA)');
    await step('A segue B', 'POST', `/users/${B.id}/toggle-follow`, 201, { token: A.token });
    await step('B: aviso de follow, sem treino', 'GET', '/notifications', 200, { token: B.token },
      (d) => has(d.data.total === 1 && d.data.items[0].type === 'follow' && d.data.items[0].workoutId === null && d.data.items[0].workout === null, 'follow com workoutId e workout nulos'));
    await step('A deixa de seguir B', 'POST', `/users/${B.id}/toggle-follow`, 200, { token: A.token });
    await step('B: o aviso sumiu', 'GET', '/notifications/unread-count', 200, { token: B.token }, (d) => has(d.data.unreadCount === 0, 'esperado 0'));
    await step('A segue B de novo', 'POST', `/users/${B.id}/toggle-follow`, 201, { token: A.token });
    await step('B: um só aviso', 'GET', '/notifications', 200, { token: B.token }, (d) => has(d.data.total === 1, 'esperado total 1'));
  }

  if (run('lista')) {
    const { A, B, C, WB, WC } = await prepare();
    await like(C.token, WB);
    await call('POST', `/workouts/${WB}/comments`, { token: A.token, json: { content: 'Oi' } });
    await call('POST', `/users/${B.id}/toggle-follow`, { token: A.token });
    await like(A.token, WC);
    title('5. A LISTA: ORDEM, PAGINAÇÃO E ISOLAMENTO');
    await step('B: a mais nova primeiro (follow, comment, like)', 'GET', '/notifications', 200, { token: B.token },
      (d) => has(d.data.items.map((n) => n.type).join(',') === 'follow,comment,like', 'ordem follow, comment, like'));
    await step('?limit=1&page=2', 'GET', '/notifications?limit=1&page=2', 200, { token: B.token },
      (d) => has(d.data.items.length === 1 && d.data.items[0].type === 'comment' && d.data.hasMore === true, 'o 2º item (comment), hasMore true'));
    await step('página além do fim', 'GET', '/notifications?page=99', 200, { token: B.token }, (d) => has(d.data.items.length === 0, 'lista vazia'));
    await step('?page=abc&limit=-5 -> padrões', 'GET', '/notifications?page=abc&limit=-5', 200, { token: B.token },
      (d) => has(d.data.page === 1 && d.data.limit === 12, 'page 1, limit 12'));
    await step('C vê só as dela', 'GET', '/notifications', 200, { token: C.token }, (d) => has(d.data.total === 1 && d.data.items[0].actor.username === 'prints14_a', 'só o like do A no treino do C'));
  }

  if (run('lida')) {
    const { A, B, C, WB } = await prepare();
    await like(A.token, WB);
    await call('POST', `/workouts/${WB}/comments`, { token: C.token, json: { content: 'Oi' } });
    await call('POST', `/users/${B.id}/toggle-follow`, { token: A.token });
    const items = (await list(B.token)).items;
    const alvo = items[0].id;
    title('6. MARCAR COMO LIDA');
    await step('B tem 3 não lidas', 'GET', '/notifications/unread-count', 200, { token: B.token }, (d) => has(d.data.unreadCount === 3, 'esperado 3'));
    await step('outra conta (C)', 'PATCH', `/notifications/${alvo}/read`, 403, { token: C.token });
    await step('id inexistente', 'PATCH', '/notifications/99999/read', 404, { token: B.token });
    await step('id "abc"', 'PATCH', '/notifications/abc/read', 400, { token: B.token });
    await step('a dona marca: unreadCount menor', 'PATCH', `/notifications/${alvo}/read`, 200, { token: B.token }, (d) => has(d.data.isRead === true && d.data.unreadCount === 2, 'unreadCount 2'));
    await step('repetir: 200 com o mesmo número', 'PATCH', `/notifications/${alvo}/read`, 200, { token: B.token }, (d) => has(d.data.unreadCount === 2, 'unreadCount 2'));
    await step('a lista reflete (uma lida)', 'GET', '/notifications', 200, { token: B.token }, (d) => has(d.data.items.filter((n) => n.isRead).length === 1, 'exatamente 1 lida'));
    await step('o contador reflete', 'GET', '/notifications/unread-count', 200, { token: B.token }, (d) => has(d.data.unreadCount === 2, 'esperado 2'));
  }

  if (run('denuncia')) {
    const { A, B, C, WB } = await prepare();
    title('7. DENÚNCIA');
    const antes = await unread(B.token);
    await step('A denuncia', 'POST', `/workouts/${WB}/report`, 201, { token: A.token, json: { reason: 'spam' } },
      (d) => has(Object.keys(d.data).sort().join(',') === 'id,reason,workoutId', 'só id, workoutId e reason'));
    await step('repetir: 409', 'POST', `/workouts/${WB}/report`, 409, { token: A.token, json: { reason: 'spam' } });
    await step('C denuncia o mesmo treino: 201', 'POST', `/workouts/${WB}/report`, 201, { token: C.token, json: { reason: 'harassment' } });
    await step('sem reason', 'POST', `/workouts/${WB}/report`, 400, { token: A.token, json: {} });
    await step('reason fora da lista', 'POST', `/workouts/${WB}/report`, 400, { token: A.token, json: { reason: 'xyz' } });
    await step('rótulo em vez da chave', 'POST', `/workouts/${WB}/report`, 400, { token: A.token, json: { reason: 'Spam ou golpes' } });
    await step('id "abc"', 'POST', '/workouts/abc/report', 400, { token: A.token, json: { reason: 'spam' } });
    await step('treino 99999', 'POST', '/workouts/99999/report', 404, { token: A.token, json: { reason: 'spam' } });
    await step('o dono denuncia o próprio treino', 'POST', `/workouts/${WB}/report`, 400, { token: B.token, json: { reason: 'spam' } });
    await step('sem token', 'POST', `/workouts/${WB}/report`, 401, { json: { reason: 'spam' } });
    await step('o dono NÃO ganha notificação', 'GET', '/notifications/unread-count', 200, { token: B.token }, (d) => has(d.data.unreadCount === antes, `continua ${antes}`));
  }

  if (run('banco')) {
    const { A, B, WB } = await prepare();
    await call('POST', `/workouts/${WB}/report`, { token: A.token, json: { reason: 'spam' } });
    title('8. BANCO: TABELAS, ÍNDICES, ENUM, ON DELETE E RECUSAS');
    const show = async (q) => { console.log(`\n${C.cyan}${C.bold}mysql> ${q}${C.reset}`); return sql(q); };
    for (const t of ['notifications', 'reports']) {
      const [ct] = await show(`SHOW CREATE TABLE ${t}`);
      console.log(ct['Create Table'].split('\n').map((l) => '  ' + l).join('\n'));
    }
    const rows = await show("SELECT TABLE_NAME, COLUMN_NAME, DELETE_RULE FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r USING (CONSTRAINT_SCHEMA, CONSTRAINT_NAME, TABLE_NAME) WHERE k.TABLE_SCHEMA = DATABASE() AND k.TABLE_NAME IN ('reports','notifications') AND k.REFERENCED_TABLE_NAME = 'workouts'");
    rows.forEach((r) => console.log(`  ${r.TABLE_NAME}.${r.COLUMN_NAME}  ON DELETE ${r.DELETE_RULE}`));
    const tryInsert = async (q, nota) => {
      console.log(`\n${C.cyan}${C.bold}mysql> ${q}${C.reset}`);
      try { await db().query(q); failCount++; console.log(`  ${C.red}✗ o banco ACEITOU (${nota})${C.reset}`); }
      catch (err) { okCount++; console.log(`  ${C.green}✓ recusada:${C.reset} ${err.original ? err.original.sqlMessage : err.message}`); }
    };
    await tryInsert(`INSERT INTO reports (user_id, workout_id, reason, created_at, updated_at) VALUES (${A.id}, ${WB}, 'spam', NOW(), NOW())`, 'linha repetida');
    await tryInsert(`INSERT INTO reports (user_id, workout_id, reason, created_at, updated_at) VALUES (${B.id}, ${WB}, 'motivo_inventado', NOW(), NOW())`, 'motivo fora do ENUM');
  }

  if (run('excluir')) {
    const { A, B, C: terceira, WB } = await prepare();  // (C é o objeto de cores neste arquivo)
    await like(A.token, WB);
    await call('POST', `/workouts/${WB}/comments`, { token: terceira.token, json: { content: 'Oi' } });
    await call('POST', `/workouts/${WB}/comments`, { token: A.token, json: { content: 'Oi 2' } });
    await like(terceira.token, WB);
    await call('POST', `/workouts/${WB}/report`, { token: A.token, json: { reason: 'spam' } });
    await call('POST', `/workouts/${WB}/report`, { token: terceira.token, json: { reason: 'other' } });
    await call('POST', `/users/${B.id}/toggle-follow`, { token: A.token });
    title('9. EXCLUIR O TREINO COM DENÚNCIAS, CURTIDAS E COMENTÁRIOS DE DUAS PESSOAS');
    await step('B: lista ANTES (4 do treino + 1 follow)', 'GET', '/notifications', 200, { token: B.token }, (d) => has(d.data.total === 5, 'esperado 5'));
    const cnt = async (q) => Number((await sql(q))[0].n);
    console.log(`\n  ANTES -> denúncias do treino: ${await cnt(`SELECT COUNT(*) n FROM reports WHERE workout_id = ${WB}`)} · avisos do treino: ${await cnt(`SELECT COUNT(*) n FROM notifications WHERE workout_id = ${WB}`)}`);
    await step('B exclui o treino', 'DELETE', `/workouts/${WB}`, 200, { token: B.token });
    const rep = await cnt(`SELECT COUNT(*) n FROM reports WHERE workout_id = ${WB}`);
    const nti = await cnt(`SELECT COUNT(*) n FROM notifications WHERE workout_id = ${WB}`);
    const orf = await cnt("SELECT COUNT(*) n FROM notifications WHERE workout_id IS NULL AND type <> 'follow'");
    const ok = rep === 0 && nti === 0 && orf === 0;
    ok ? okCount++ : failCount++;
    console.log(`  DEPOIS -> denúncias do treino: ${rep} · avisos do treino: ${nti} · avisos órfãos (workout_id NULL, não follow): ${orf}   ${ok ? C.green + '✓' : C.red + '✗'}${C.reset}`);
    await step('B: sobrou só o aviso de follow', 'GET', '/notifications', 200, { token: B.token }, (d) => has(d.data.total === 1 && d.data.items[0].type === 'follow', 'só o follow'));
  }

  if (run('logout')) {
    title('10. LOGOUT: 400 COM O CABEÇALHO DE CORS');
    const res = await fetch(`${BASE}/logout`, { method: 'POST', headers: { Origin: 'http://localhost:5173', 'Content-Type': 'application/json' }, body: 'null' });
    const cors = res.headers.get('access-control-allow-origin');
    const ok = res.status === 400 && !!cors;
    ok ? okCount++ : failCount++;
    console.log(`\n${C.cyan}${C.bold}▶ POST /logout${C.reset}${C.dim}  (Origin: http://localhost:5173, corpo "null")${C.reset}`);
    console.log(`  Status: ${res.status}   esperado: 400  ${res.status === 400 ? C.green + '✓' : C.red + '✗'}${C.reset}`);
    console.log(`  Access-Control-Allow-Origin: ${cors}   ${cors ? C.green + '✓' : C.red + '✗ ausente (cors depois dos parsers?)'}${C.reset}`);
    console.log(pretty(await res.json().catch(() => null)).split('\n').map((l) => '  ' + l).join('\n'));
  }

  if (run('regressao')) {
    const { A, B, C, WA, WB } = await prepare();
    title('11. REGRESSÃO');
    await step('curtir', 'POST', `/workouts/${WB}/toggle-like`, 201, { token: A.token });
    await step('descurtir', 'POST', `/workouts/${WB}/toggle-like`, 200, { token: A.token });
    await step('comentar', 'POST', `/workouts/${WB}/comments`, 201, { token: A.token, json: { content: 'Regressão da Aula 14' } });
    await step('comentários', 'GET', `/workouts/${WB}/comments`, 200, {});
    await step('seguir', 'POST', `/users/${B.id}/toggle-follow`, 201, { token: A.token });
    await step('seguidores', 'GET', `/users/${B.id}/followers`, 200, {});
    await step('seguindo', 'GET', `/users/${A.id}/following`, 200, {});
    await step('feed "Seguindo"', 'GET', '/following-workouts', 200, { token: A.token });
    await step('feed geral', 'GET', '/feed', 200, { token: A.token });
    const rid = (await call('POST', '/routines', { token: A.token, json: { title: 'Rotina da regressão', isPublic: false } })).data.data.id;
    await step('coleção: adicionar treino', 'POST', `/routines/${rid}/workouts`, 201, { token: A.token, json: { workoutId: WB } });
    await step('minhas rotinas', 'GET', '/my-routines', 200, { token: A.token });
    await step('busca', 'GET', '/search?q=treino', 200, {});
    const novo = new FormData();
    novo.append('title', 'Treino novo da regressão');
    novo.append('image', new Blob([PNG], { type: 'image/png' }), 'treino.png');
    await step('upload (treino novo)', 'POST', '/workouts', 201, { token: A.token, form: novo });
    const form = new FormData();
    form.append('title', 'Treino do A editado');
    await step('edição', 'PUT', `/workouts/${WA}`, 200, { token: A.token, form });
    await step('id inválido em /users/abc/followers', 'GET', '/users/abc/followers', 400, {}, (d) => has(d.message === 'Identificador de usuário inválido.', 'mensagem do parseId'));
    await call('POST', `/users/${B.id}/toggle-follow`, { token: A.token });
  }

  if (section === 'controle-reports') {
    const { A, B, C } = await prepare();
    const WX = await uploadWorkout(A.token, 'Treino para o controle');
    await like(B.token, WX);
    await call('POST', `/workouts/${WX}/report`, { token: C.token, json: { reason: 'spam' } });
    title('CONTROLE (a): EXCLUIR COM O destroy DAS DENÚNCIAS COMENTADO');
    await step('A exclui o treino (esperado no controle: 500)', 'DELETE', `/workouts/${WX}`, 500, { token: A.token },
      (d) => has(/foreign key/i.test(d.message || ''), 'a mensagem deveria citar a chave estrangeira'));
    await sql(`DELETE FROM reports WHERE workout_id = ${WX}`);
    await call('DELETE', `/workouts/${WX}`, { token: A.token });
  }

  if (section === 'controle-orfa') {
    const { A, B } = await prepare();
    const WX = await uploadWorkout(A.token, 'Treino para o controle');
    await like(B.token, WX);
    title('CONTROLE (b): EXCLUIR COM O destroy DAS NOTIFICAÇÕES COMENTADO');
    await step('A exclui o treino (esperado: 200)', 'DELETE', `/workouts/${WX}`, 200, { token: A.token });
    const q = "SELECT id, user_id, actor_id, type, workout_id FROM notifications WHERE workout_id IS NULL AND type <> 'follow'";
    console.log(`\n${C.cyan}${C.bold}mysql> ${q}${C.reset}`);
    const rows = await sql(q);
    rows.forEach((r) => console.log(`  id ${r.id} · user_id ${r.user_id} · actor_id ${r.actor_id} · type ${r.type} · workout_id ${r.workout_id}`));
    const ok = rows.length >= 1;
    ok ? okCount++ : failCount++;
    console.log(`  ${rows.length} linha(s) órfã(s)   ${ok ? C.green + '✓ (esperado no controle: sobra 1)' : C.red + '✗ nenhuma órfã: o bloco comentado está ativo?'}${C.reset}`);
    await sql("DELETE FROM notifications WHERE workout_id IS NULL AND type <> 'follow'");
    console.log(`  ${C.dim}(linha órfã apagada)${C.reset}`);
  }

  console.log(`\n${C.bold}Resumo: ${C.green}${okCount} ok${C.reset}${C.bold}, ${failCount ? C.red : C.dim}${failCount} fora do esperado${C.reset}\n`);
  if (HTML) {
    startSection('Resumo');
    writeReport();
    realLog(`Resumo: ${okCount} ok, ${failCount} fora do esperado`);
  }
  if (sequelizeInstance) await sequelizeInstance.close();
  process.exit(failCount ? 1 : 0);
}

main().catch((err) => {
  console.error(`${C.red}Erro inesperado:${C.reset}`, err.message);
  process.exit(1);
});
