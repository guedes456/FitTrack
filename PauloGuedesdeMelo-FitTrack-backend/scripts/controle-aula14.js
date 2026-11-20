// TESTE DE CONTROLE da Etapa 4 (Atividade 14), em UM comando.
//
//   node scripts/controle-aula14.js reports   (a) sem apagar as DENÚNCIAS do treino
//   node scripts/controle-aula14.js orfa      (b) sem apagar as NOTIFICAÇÕES do treino
//   (acrescente --html para gerar também o relatorio-atividade14.html)
//   (acrescente --manual se a sua API NÃO reinicia sozinha: nodemon = "npm run dev")
//
// O que ele faz:
//   1) comenta, em modules/workout/workoutService.js, a linha do destroy
//      escolhida (Report.destroy ou Notification.destroy) dentro de deleteWorkout;
//   2) espera a API reiniciar e roda o teste de controle:
//        reports -> excluir o treino dá 500 citando a chave estrangeira de `reports`
//        orfa    -> excluir dá 200, mas sobra uma notificação com workout_id NULL
//      Esse é o resultado que vai no print (controle-reports.jpg / controle-orfa.jpg);
//   3) RESTAURA o arquivo original, aconteça o que acontecer (também com Ctrl+C).
// Ao final, "git status" não deve mostrar workoutService.js modificado.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const readline = require('readline');

const BASE = process.env.API_URL || 'http://localhost:3000/api';
const FILE = path.join(__dirname, '..', 'modules', 'workout', 'workoutService.js');
const BACKUP = path.join(os.tmpdir(), 'workoutService.original.backup.js');
const WHICH = process.argv.slice(2).find((a) => !a.startsWith('--'));
const LINES = {
  reports: '    await Report.destroy({ where: { workoutId: workout.id }, transaction });',
  orfa: '    await Notification.destroy({ where: { workoutId: workout.id }, transaction });'
};
if (!LINES[WHICH]) {
  console.error('Use: node scripts/controle-aula14.js reports | orfa  [--html] [--manual]');
  process.exit(1);
}
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
  const line = LINES[WHICH];
  if (original.includes('CONTROLE (linha comentada')) {
    console.error('O arquivo já está com uma linha comentada. Rode: git restore modules/workout/workoutService.js');
    process.exit(1);
  }
  if (!original.includes(line)) {
    console.error('Não achei a linha do destroy em deleteWorkout. O arquivo foi alterado?');
    process.exit(1);
  }
  if (!(await apiUp())) {
    console.error(`API fora do ar em ${BASE}. Rode "npm run dev" no backend primeiro.`);
    process.exit(1);
  }

  fs.writeFileSync(BACKUP, original);
  restored = false;
  fs.writeFileSync(FILE, original.replace(line, '    // CONTROLE (linha comentada por scripts/controle-aula14.js)\n    // ' + line.trim()));
  console.log(`✔ Linha comentada em workoutService.js: ${line.trim()}`);

  try {
    if (MANUAL) await ask('Reinicie a API (Ctrl+C e npm run dev, no outro terminal) e aperte Enter aqui... ');
    else if (!(await waitForApi('depois de comentar'))) return;

    console.log(`\n=== TESTE DE CONTROLE (${WHICH}) ===`);
    const run = spawnSync(process.execPath, [path.join(__dirname, 'prints-atividade14.js'), `controle-${WHICH}`, ...EXTRA], { stdio: 'inherit' });
    if (run.status === 0) {
      console.log('\n✔ Resultado de controle obtido. Tire o print agora.');
    } else {
      console.log('\n⚠ O resultado NÃO foi o de controle (veja o ✗ acima): a API reiniciou com a linha comentada? Tente --manual.');
    }
    await ask('\nTire o print e aperte Enter para RESTAURAR o código correto... ');
  } finally {
    restore();
  }
  if (MANUAL) console.log('Reinicie a API de novo (Ctrl+C e npm run dev).');
  else { await waitForApi('depois de restaurar'); console.log('✔ API reiniciada com o código correto.'); }
}

main().catch((err) => { restore(); console.error('Erro:', err.message); process.exit(1); });
