// TESTE DE CONTROLE da Etapa 5 (Atividade 13), em UM comando.
//
//   node scripts/controle-contador.js            (API rodando com "npm run dev" = nodemon)
//   node scripts/controle-contador.js --html     (gera também o relatorio-atividade13.html)
//   node scripts/controle-contador.js --manual   (se a sua API NÃO reinicia sozinha)
//
// O que ele faz:
//   1) comenta, em modules/workout/workoutService.js, o bloco da Etapa 5 (o que
//      limpa a junção e desconta o treinosCount das rotinas ao excluir um treino);
//   2) espera a API reiniciar e roda o teste "contador": o resultado esperado é o
//      ERRADO (treinosCount continua 1 depois de excluir o treino) => é o print
//      contador-controle.jpg;
//   3) RESTAURA o arquivo original, aconteça o que acontecer (também com Ctrl+C), e
//      espera a API reiniciar de novo.
// Ao final, "git status" não deve mostrar workoutService.js modificado.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const readline = require('readline');

const BASE = process.env.API_URL || 'http://localhost:3000/api';
const FILE = path.join(__dirname, '..', 'modules', 'workout', 'workoutService.js');
const BACKUP = path.join(os.tmpdir(), 'workoutService.original.backup.js');
const START = '    const links = await RoutineWorkout.findAll({';
const END = '    await workout.destroy({ transaction });';
const MANUAL = process.argv.includes('--manual');
const EXTRA = process.argv.filter((a) => a === '--html');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ask = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(question, () => { rl.close(); resolve(); });
});

async function apiUp() {
  try { return (await fetch(`${BASE}/`)).status === 200; } catch { return false; }
}
async function waitForApi(label) {
  await sleep(3500); // dá tempo ao nodemon de perceber a mudança e derrubar a API
  for (let i = 0; i < 40; i++) {
    if (await apiUp()) return true;
    await sleep(500);
  }
  console.error(`A API não voltou (${label}). Veja o terminal dela.`);
  return false;
}

let restored = true;
function restore() {
  if (restored) return;
  fs.copyFileSync(BACKUP, FILE);
  restored = true;
  console.log('\n✔ workoutService.js restaurado ao original.');
}
process.on('SIGINT', () => { restore(); process.exit(130); });

async function main() {
  const original = fs.readFileSync(FILE, 'utf8');
  const a = original.indexOf(START);
  const b = original.indexOf(END);
  if (original.includes('/* CONTROLE')) {
    console.error('O arquivo já está com o bloco comentado. Rode: git restore modules/workout/workoutService.js');
    process.exit(1);
  }
  if (a === -1 || b === -1 || b < a) {
    console.error('Não achei o bloco da Etapa 5 em deleteWorkout. O arquivo foi alterado?');
    process.exit(1);
  }
  if (!(await apiUp())) {
    console.error(`API fora do ar em ${BASE}. Rode "npm run dev" no backend primeiro.`);
    process.exit(1);
  }

  fs.writeFileSync(BACKUP, original);
  restored = false;
  const commented = original.slice(0, a) + '    /* CONTROLE (bloco comentado por scripts/controle-contador.js)\n' +
    original.slice(a, b) + '    */\n\n' + original.slice(b);
  fs.writeFileSync(FILE, commented);
  console.log('✔ Bloco da Etapa 5 comentado em workoutService.js.');

  try {
    if (MANUAL) await ask('Reinicie a API (Ctrl+C e npm run dev, no outro terminal) e aperte Enter aqui... ');
    else if (!(await waitForApi('depois de comentar'))) return;

    console.log('\n=== TESTE DE CONTROLE (esperado: contador ERRADO, com ✗) ===');
    const run = spawnSync(process.execPath, [path.join(__dirname, 'prints-atividade13.js'), 'contador', ...EXTRA], { stdio: 'inherit' });
    if (run.status === 0) {
      console.log('\n⚠ O teste passou (✓): a API NÃO reiniciou com o bloco comentado. Use --manual.');
    } else {
      console.log('\n✔ Resultado de controle obtido: o contador ficou ERRADO. Tire o print agora (contador-controle.jpg).');
    }
    await ask('\nTire o print e aperte Enter para RESTAURAR o código correto... ');
  } finally {
    restore();
  }
  if (MANUAL) console.log('Reinicie a API de novo (Ctrl+C e npm run dev).');
  else { await waitForApi('depois de restaurar'); console.log('✔ API reiniciada com o código correto.'); }
}

main().catch((err) => { restore(); console.error('Erro:', err.message); process.exit(1); });
