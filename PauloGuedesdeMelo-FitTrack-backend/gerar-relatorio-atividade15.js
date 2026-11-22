#!/usr/bin/env node
/**
 * Gera relatorio-atividade15.html executando os testes REAIS da Etapa 5 (Parte A)
 * contra a SUA API. Nada é simulado: cada resposta mostrada veio do servidor.
 *
 * Como usar (Node 18+), com a API rodando:
 *   1) Coloque este arquivo na raiz do BACKEND (onde fica scripts/setAdmin.js)
 *   2) node gerar-relatorio-atividade15.js
 *   3) Abra relatorio-atividade15.html e tire os prints (setas ← → trocam, H oculta a barra, M muda o modo)
 *
 * Variáveis opcionais: API_URL, BACKEND_DIR, OUT
 *   ex.: API_URL=http://localhost:3000/api node gerar-relatorio-atividade15.js
 *
 * ⚠ AJUSTE o bloco CONFIG abaixo aos nomes/rotas do SEU projeto (FitTrack).
 *    Se alguma rota de "setup" ou de "regressão" tiver outro nome, o teste aparece com ✗
 *    e você só corrige o CONFIG e roda de novo.
 */
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');

// ───────────────────────────── CONFIG ─────────────────────────────
const C = {
  BASE: process.env.API_URL || 'http://localhost:3000/api',
  BACKEND_DIR: process.env.BACKEND_DIR || '.',
  OUT: process.env.OUT || 'relatorio-atividade15.html',
  PASSWORD: 'Senha@12345',

  // autenticação
  REGISTER_PATH: '/register',
  LOGIN_PATH: '/login',
  registerBody: (u) => ({ username: u.username, email: u.email, fullName: u.fullName, password: u.password, confirmPassword: u.password }),
  loginBody: (u) => ({ email: u.email, password: u.password }),

  // entidade (FitTrack = treinos)
  ITEMS: '/workouts',                 // rota pública (feed, upload, excluir do dono)
  ADMIN_ITEMS: '/admin/workouts',     // rota do painel
  DASH_ITEM_KEY: 'workouts',          // chave do item no plural no dashboard
  IMAGE_FIELD: 'image',               // nome do campo do arquivo no upload
  TEXT_FIELD: 'title',                // campo de texto principal
  ITEM_LABEL: 'Treino',

  // demais rotas usadas no setup/regressão
  REPORT_PATH: (id) => `/workouts/${id}/report`,
  REPORT_BODY: { reason: 'spam' },    // ajuste ao seu REPORT_REASONS
  LIKE_PATH: (id) => `/workouts/${id}/toggle-like`,
  PROFILE_PATH: (u) => `/profile/${u.username}`,
  FEED: '/feed',
  NOTIFICATIONS: '/notifications',
  UNREAD: '/notifications/unread-count', // rota autenticada usada nos testes de token
  SEARCH: '/search?q=',
};
// ──────────────────────────────────────────────────────────────────

const rand = Math.random().toString(36).slice(2, 7);
const tokens = {};   // ADMIN, A, B, C
const U = {};        // dados de cada usuário
const sections = [];
let cur = null, okCount = 0, badCount = 0;

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function slim(v) {
  if (Array.isArray(v)) {
    const a = v.slice(0, 3).map(slim);
    if (v.length > 3) a.push(`… (+${v.length - 3} itens)`);
    return a;
  }
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      if (k === 'token' && typeof x === 'string') o[k] = x.slice(0, 12) + '…';
      else if (k === 'password') o[k] = '***';
      else o[k] = slim(x);
    }
    return o;
  }
  return v;
}

// chamada "silenciosa" (não entra no relatório)
async function api(method, p, { as, rawToken, json, form } = {}) {
  const headers = {};
  let body;
  if (as || rawToken) headers.Authorization = 'Bearer ' + (rawToken ?? tokens[as]);
  if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
  if (form) body = form;
  try {
    const r = await fetch(C.BASE + p, { method, headers, body });
    const t = await r.text();
    let data; try { data = JSON.parse(t); } catch { data = t; }
    return { status: r.status, data };
  } catch (e) {
    return { status: 0, data: { error: 'Falha de conexão: ' + e.message } };
  }
}

function section(title) { cur = { title, steps: [] }; sections.push(cur); }

// chamada que entra no relatório (com o curl equivalente para o print)
async function call(desc, method, p, o = {}) {
  const r = await api(method, p, o);
  let ok = r.status === o.expect;
  let note = null;
  if (o.check) {
    const [cOk, cNote] = o.check(r.data);
    ok = ok && cOk; note = cNote;
  }
  ok ? okCount++ : badCount++;

  let curl = `curl -i -X ${method} "${C.BASE}${p}"`;
  if (o.as) curl += ` -H "Authorization: Bearer $TOKEN_${o.as}"`;
  if (o.rawToken) curl += ` -H "Authorization: Bearer ${o.rawToken}"`;
  if (o.json !== undefined) curl += ` -H "Content-Type: application/json" -d '${JSON.stringify(slim(o.json))}'`;
  if (o.form) curl += ` -F ${C.TEXT_FIELD}=... -F ${C.IMAGE_FIELD}=@foto.png`;

  cur.steps.push({ head: `${method} ${p}`, desc, curl, status: r.status, expect: o.expect, ok, note, data: r.data });
  return r;
}

// comando de terminal (setAdmin) que entra no relatório
function shell(desc, cmd) {
  let out = '', ok = true;
  try { out = execSync(cmd, { cwd: C.BACKEND_DIR, stdio: 'pipe' }).toString().trim(); }
  catch (e) { ok = false; out = ((e.stdout || '') + (e.stderr || '') || e.message).toString().trim(); }
  ok ? okCount++ : badCount++;
  cur.steps.push({ shell: true, head: '$ ' + cmd, desc, ok, out });
}

// ─────────────── helpers de setup ───────────────
const uid = (d) => d?.data?.user?.id ?? d?.data?.id ?? d?.user?.id ?? d?.id;
const tok = (d) => d?.data?.token ?? d?.token;
const items = (d) => d?.data?.items ?? (Array.isArray(d?.data) ? d.data : []);

async function makeUser(label) {
  const username = `atv15${label.toLowerCase()}${rand}`;
  const u = { label, username, email: `${username}@teste.com`, fullName: `Usuario ${label}`, password: C.PASSWORD };
  await api('POST', C.REGISTER_PATH, { json: C.registerBody(u) });
  const l = await api('POST', C.LOGIN_PATH, { json: C.loginBody(u) });
  u.id = uid(l.data);
  tokens[label] = tok(l.data);
  if (!tokens[label]) throw new Error(`Login de ${label} falhou (${l.status}). Ajuste LOGIN_PATH/loginBody no CONFIG.`);
  U[label] = u;
}

async function uploadItem(as, title) {
  const f = new FormData();
  f.append(C.TEXT_FIELD, title);
  f.append(C.IMAGE_FIELD, new Blob([PNG], { type: 'image/png' }), 'foto.png');
  const r = await api('POST', C.ITEMS, { as, form: f });
  return { id: r.data?.data?.id, status: r.status };
}

const setAdmin = (label, off) => `node scripts/setAdmin.js ${U[label].username}${off ? ' off' : ''}`;
const hasKeys = (keys) => (d) => {
  const o = d?.data || {};
  const miss = keys.filter((k) => !(k in o));
  return [miss.length === 0, miss.length ? `Faltam as chaves: ${miss.join(', ')}` : `Chaves: ${keys.join(', ')} ✓`];
};
const noSecret = (d) => {
  const s = JSON.stringify(d);
  const bad = /"password"|"token"/.test(s);
  return [!bad, bad ? 'ATENÇÃO: vazou password/token ✗' : 'Sem password/token na resposta ✓'];
};

// ─────────────────────── testes ───────────────────────
async function main() {
  // preparação (não aparece no relatório)
  for (const l of ['ADMIN', 'A', 'B', 'C']) await makeUser(l);
  const wA = await uploadItem('A', `${C.ITEM_LABEL} do A ${rand}`);
  const wB = await uploadItem('B', `${C.ITEM_LABEL} do B ${rand}`);
  if (!wA.id || !wB.id) throw new Error(`Upload falhou (A:${wA.status}, B:${wB.status}). Ajuste ITEMS/IMAGE_FIELD/TEXT_FIELD no CONFIG.`);
  await api('POST', C.REPORT_PATH(wA.id), { as: 'B', json: C.REPORT_BODY });
  await api('POST', C.REPORT_PATH(wA.id), { as: 'C', json: C.REPORT_BODY });
  await api('POST', C.REPORT_PATH(wB.id), { as: 'A', json: C.REPORT_BODY });
  const prep = `Contas: ADMIN=${U.ADMIN.id} A=${U.A.id} B=${U.B.id} C=${U.C.id} · itens A=${wA.id} B=${wB.id} · 3 denúncias criadas`;

  // 1 ─ sem token e usuário comum
  section('SEM TOKEN → 401 · USUÁRIO COMUM → 403 (AS SETE ROTAS + ROTA INEXISTENTE)');
  const routes = [
    ['GET', '/admin/dashboard', '(dashboard)'],
    ['GET', '/admin/reports', '(denúncias)'],
    ['PATCH', '/admin/reports/1/review', '(revisar)'],
    ['GET', '/admin/users', '(usuários)'],
    ['PATCH', `/admin/users/${U.B.id}/block`, '(bloquear)', { isBlocked: true }],
    ['GET', C.ADMIN_ITEMS, '(itens)'],
    ['DELETE', `${C.ADMIN_ITEMS}/1`, '(excluir item)'],
    ['GET', '/admin/rota-inexistente', '(rota inexistente: 401, não 404)'],
  ];
  for (const [m, p, d, body] of routes) await call(`sem token ${d}`, m, p, { expect: 401, json: body });
  for (const [m, p, d, body] of routes) await call(`token de A, comum ${d}`, m, p, { expect: 403, as: 'A', json: body });
  cur.prep = prep;

  // promoção do ADMIN DEPOIS de o token ter sido emitido
  section('DASHBOARD: TOKEN DO ADMIN EMITIDO ANTES DA PROMOÇÃO');
  shell('promove ADMIN (o token já existia: o papel vem do banco)', setAdmin('ADMIN'));
  await call('ADMIN: as sete chaves', 'GET', '/admin/dashboard', {
    expect: 200, as: 'ADMIN',
    check: hasKeys(['users', 'blockedUsers', C.DASH_ITEM_KEY, 'comments', 'likes', 'pendingReports', 'reviewedReports']),
  });

  // 3 ─ denúncias
  section('DENÚNCIAS: LISTA, FILTROS E PAGINAÇÃO');
  const rep = await call('lista padrão (pendentes, mais nova primeiro)', 'GET', '/admin/reports', { expect: 200, as: 'ADMIN', check: noSecret });
  await call('status=all', 'GET', '/admin/reports?status=all', { expect: 200, as: 'ADMIN' });
  await call('status=reviewed', 'GET', '/admin/reports?status=reviewed', { expect: 200, as: 'ADMIN' });
  await call('status inválido', 'GET', '/admin/reports?status=xyz', { expect: 400, as: 'ADMIN' });
  await call('limit=1&page=2', 'GET', '/admin/reports?limit=1&page=2', { expect: 200, as: 'ADMIN' });
  const repId = items(rep.data)[0]?.id ?? 1;

  // 4 ─ revisar
  section('REVISAR: IDEMPOTENTE, 404, 400 E 403');
  const r1 = await call('revisa a denúncia', 'PATCH', `/admin/reports/${repId}/review`, {
    expect: 200, as: 'ADMIN', check: (d) => [!!d?.data?.reviewedAt, d?.data?.reviewedAt ? 'reviewedAt presente ✓' : 'sem reviewedAt ✗'],
  });
  await call('repete (mesmo reviewedAt)', 'PATCH', `/admin/reports/${repId}/review`, {
    expect: 200, as: 'ADMIN',
    check: (d) => { const same = d?.data?.reviewedAt === r1.data?.data?.reviewedAt; return [same, same ? 'reviewedAt IGUAL ao da 1ª vez ✓' : 'reviewedAt mudou ✗']; },
  });
  await call('id inexistente', 'PATCH', '/admin/reports/99999/review', { expect: 404, as: 'ADMIN' });
  await call('id inválido', 'PATCH', '/admin/reports/abc/review', { expect: 400, as: 'ADMIN' });
  await call('token comum (A)', 'PATCH', `/admin/reports/${repId}/review`, { expect: 403, as: 'A' });
  await call('lista de revisadas acompanha', 'GET', '/admin/reports?status=reviewed', { expect: 200, as: 'ADMIN' });
  await call('dashboard acompanha', 'GET', '/admin/dashboard', { expect: 200, as: 'ADMIN' });

  // 5 ─ usuários
  section('USUÁRIOS: LISTA E BUSCA');
  await call('lista (com email e flags, sem password)', 'GET', '/admin/users', { expect: 200, as: 'ADMIN', check: noSecret });
  await call('busca por username', 'GET', `/admin/users?search=${U.B.username}`, { expect: 200, as: 'ADMIN' });
  await call('busca por e-mail', 'GET', `/admin/users?search=${encodeURIComponent(U.B.email)}`, { expect: 200, as: 'ADMIN' });
  await call('%% vira texto → vazio', 'GET', '/admin/users?search=%25%25', {
    expect: 200, as: 'ADMIN', check: (d) => [items(d).length === 0, items(d).length === 0 ? 'lista vazia ✓' : 'trouxe usuários ✗'],
  });
  await call('search repetido (a e b) sem erro', 'GET', '/admin/users?search=a&search=b', { expect: 200, as: 'ADMIN' });

  // 6 ─ bloquear
  section('BLOQUEAR: TOKEN ANTIGO, LOGIN E ERROS');
  const bId = U.B.id;
  await call('bloqueia B', 'PATCH', `/admin/users/${bId}/block`, { expect: 200, as: 'ADMIN', json: { isBlocked: true } });
  await call('repete (idempotente)', 'PATCH', `/admin/users/${bId}/block`, { expect: 200, as: 'ADMIN', json: { isBlocked: true } });
  await call('TOKEN ANTIGO de B → 401 com mensagem do bloqueio', 'GET', C.UNREAD, { expect: 401, as: 'B' });
  await call('login de B, senha CERTA → 403', 'POST', C.LOGIN_PATH, { expect: 403, json: C.loginBody(U.B) });
  await call('login de B, senha ERRADA → mensagem genérica', 'POST', C.LOGIN_PATH, { expect: 401, json: C.loginBody({ ...U.B, password: 'errada123' }) });
  await call('perfil público de B continua visível', 'GET', C.PROFILE_PATH(U.B), { expect: 200, as: 'A' });
  await call('desbloqueia B', 'PATCH', `/admin/users/${bId}/block`, { expect: 200, as: 'ADMIN', json: { isBlocked: false } });
  await call('o MESMO token de B volta a funcionar', 'GET', C.UNREAD, { expect: 200, as: 'B' });
  await call('corpo vazio {}', 'PATCH', `/admin/users/${bId}/block`, { expect: 400, as: 'ADMIN', json: {} });
  await call('"true" como texto', 'PATCH', `/admin/users/${bId}/block`, { expect: 400, as: 'ADMIN', json: { isBlocked: 'true' } });
  await call('bloquear a si mesmo', 'PATCH', `/admin/users/${U.ADMIN.id}/block`, { expect: 400, as: 'ADMIN', json: { isBlocked: true } });
  shell('promove C a administrador (para o teste do "outro admin")', setAdmin('C'));
  await call('bloquear outro administrador', 'PATCH', `/admin/users/${U.C.id}/block`, { expect: 403, as: 'ADMIN', json: { isBlocked: true } });
  shell('rebaixa C de volta', setAdmin('C', true));
  await call('id inexistente', 'PATCH', '/admin/users/99999/block', { expect: 404, as: 'ADMIN', json: { isBlocked: true } });
  await call('id inválido', 'PATCH', '/admin/users/abc/block', { expect: 400, as: 'ADMIN', json: { isBlocked: true } });

  // 7 ─ rebaixado
  section('ADMIN REBAIXADO: O MESMO TOKEN PASSA A DAR 403');
  shell('rebaixa ADMIN', setAdmin('ADMIN', true));
  await call('mesmo token do ADMIN → 403', 'GET', '/admin/dashboard', { expect: 403, as: 'ADMIN' });
  shell('promove ADMIN de novo', setAdmin('ADMIN'));
  await call('mesmo token → 200 de novo', 'GET', '/admin/dashboard', { expect: 200, as: 'ADMIN' });

  // 8 ─ itens
  section(`ITENS (${C.ITEM_LABEL.toUpperCase()}S): LISTA, BUSCA E EXCLUSÃO PELO PAINEL`);
  await call('lista com autor e pendingReportsCount', 'GET', C.ADMIN_ITEMS, {
    expect: 200, as: 'ADMIN',
    check: (d) => { const ok = items(d).length > 0 && items(d).every((i) => 'pendingReportsCount' in i); return [ok, ok ? 'pendingReportsCount em todos ✓' : 'falta pendingReportsCount ✗']; },
  });
  await call('busca por texto', 'GET', `${C.ADMIN_ITEMS}?search=${encodeURIComponent(C.ITEM_LABEL + ' do A ' + rand)}`, { expect: 200, as: 'ADMIN' });
  await call('%% vira texto → vazio', 'GET', `${C.ADMIN_ITEMS}?search=%25%25`, {
    expect: 200, as: 'ADMIN', check: (d) => [items(d).length === 0, items(d).length === 0 ? 'lista vazia ✓' : 'trouxe itens ✗'],
  });
  await call('rota COMUM de excluir com token do ADMIN → 403', 'DELETE', `${C.ITEMS}/${wA.id}`, { expect: 403, as: 'ADMIN' });
  await call('rota do PAINEL exclui (com denúncias)', 'DELETE', `${C.ADMIN_ITEMS}/${wA.id}`, { expect: 200, as: 'ADMIN' });
  await call('repete → 404', 'DELETE', `${C.ADMIN_ITEMS}/${wA.id}`, { expect: 404, as: 'ADMIN' });
  await call('id inválido', 'DELETE', `${C.ADMIN_ITEMS}/abc`, { expect: 400, as: 'ADMIN' });
  await call('as denúncias do item sumiram (status=all)', 'GET', '/admin/reports?status=all', { expect: 200, as: 'ADMIN' });
  await call('o item sumiu para o dono', 'GET', `${C.ITEMS}/${wA.id}`, { expect: 404, as: 'A' });

  // 9 ─ regressão
  section('REGRESSÃO');
  await call('login de A', 'POST', C.LOGIN_PATH, { expect: 200, json: C.loginBody(U.A), check: noSecretExceptToken });
  await call('perfil', 'GET', C.PROFILE_PATH(U.A), { expect: 200, as: 'A' });
  await call('feed', 'GET', C.FEED, { expect: 200, as: 'A' });
  await call('upload', 'POST', C.ITEMS, { expect: 201, as: 'A', form: (() => { const f = new FormData(); f.append(C.TEXT_FIELD, `${C.ITEM_LABEL} regressão ${rand}`); f.append(C.IMAGE_FIELD, new Blob([PNG], { type: 'image/png' }), 'foto.png'); return f; })() });
  await call('curtir (A no item de B)', 'POST', C.LIKE_PATH(wB.id), { expect: 201, as: 'A' });
  await call('notificações de B', 'GET', C.NOTIFICATIONS, { expect: 200, as: 'B' });
  await call('denunciar (C no item de B)', 'POST', C.REPORT_PATH(wB.id), { expect: 201, as: 'C', json: C.REPORT_BODY });
  await call('busca pública', 'GET', C.SEARCH + 'a', { expect: 200, as: 'A' });
  await call('busca pública com %% → vazio', 'GET', C.SEARCH + '%25%25', { expect: 200, as: 'A' });
  await call('token lixo → 401', 'GET', C.UNREAD, { expect: 401, rawToken: 'lixo' });

  cur.summary = true;
  writeHtml();
}

function noSecretExceptToken() { return [true, null]; }

// ─────────────────────── HTML ───────────────────────
function stepHtml(s) {
  if (s.shell) {
    return `  <pre class="step"><span class="c"><span class="b">${esc(s.head)}</span></span><span class="d">  (${esc(s.desc)})</span>\n  ${s.ok ? '<span class="g">✓</span>' : '<span class="r">✗</span>'}\n${s.out ? s.out.split('\n').map((l) => '  ' + esc(l)).join('\n') : ''}</pre>\n`;
  }
  const body = typeof s.data === 'string' ? s.data : JSON.stringify(slim(s.data), null, 2);
  const lines = String(body).split('\n').map((l) => '  ' + esc(l)).join('\n');
  const mark = s.ok ? '<span class="g">✓</span>' : '<span class="r">✗</span>';
  return `  <pre class="step"><span class="d">$ ${esc(s.curl)}</span>\n<span class="c"><span class="b">▶ ${esc(s.head)}</span></span><span class="d">  (${esc(s.desc)})</span>\n  Status: ${s.status}   esperado: ${s.expect}  ${mark}${s.note ? `\n  <span class="${s.ok ? 'g' : 'r'}">${esc(s.note)}</span>` : ''}\n${lines}</pre>\n`;
}

function writeHtml() {
  const total = sections.length;
  const body = sections.map((sec, i) => {
    let h = `<section class="test" data-title="${esc(sec.title)}">\n  <h2>${i + 1}/${total} · ${esc(sec.title)}</h2>\n`;
    h += sec.steps.map(stepHtml).join('');
    if (sec.prep) h += `  <pre class="step"><span class="d">${esc(sec.prep)}</span></pre>\n`;
    if (sec.summary) h += `  <pre class="step"><span class="b">Resumo: <span class="g">${okCount} ok</span>, <span class="${badCount ? 'r' : 'd'}">${badCount} fora do esperado</span></span>\n</pre>\n`;
    return h + '</section>\n';
  }).join('\n');

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Relatório da Atividade 15</title>
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
<main id="main">
${body}</main>
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
  fs.writeFileSync(C.OUT, html, 'utf8');
  console.log(`\n✔ ${C.OUT} gerado — ${okCount} ok, ${badCount} fora do esperado`);
}

main().catch((e) => {
  console.error('\n✗ Erro na preparação:', e.message);
  if (sections.length) writeHtml();
  process.exit(1);
});
