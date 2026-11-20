## Atividade 14 — Notificações e Denúncias

### Ficha (nomes do meu projeto)
Entidade = **treino** (`Workout`, `workoutId`) · notificação: `Notification` / `notifications` / módulo `notification` · denúncia: `Report` / `reports` / módulo `report` · rota da denúncia: `POST /api/workouts/:workoutId/report` · textos: "curtiu o seu treino", "comentou no seu treino", "começou a seguir você" · tela `NotificationsView` e modal `ReportWorkoutModal` · gatilhos: `toggleLike`, `createComment`, `toggleFollow`.

### Contextualização e alcançabilidade (antes de programar o front)

| Peça | Caminho(s) de clique |
|---|---|
| Notificações | **sino na Navbar** (visível em todas as telas, só para quem está logado) |
| Marcar como lida | botão "Marcar como lida" na linha **e** clique no texto da própria notificação |
| Ir ao que gerou o aviso | clique no texto: **treino** (curtir/comentar) ou **perfil** (seguir) |
| Ver as mais antigas / as novas | botão "Carregar mais notificações" no fim / botão "Atualizar" no topo |
| Denunciar | botão "Denunciar" no Detalhe do treino (visitante → login → volta; o dono não o vê) |

Verificação no `router/index.js`: a rota `notifications` (`/notificacoes`) **já existia**, com `requiresAuth: true` e o mesmo nome que a Navbar usa em `{ name: 'notifications' }`; o arquivo `NotificationsView.vue` existia como **placeholder** ("Em construção") e foi substituído pela tela. A Navbar tinha um link "Notificações" por caminho fixo (`to="/notificacoes"`); passou a usar o nome da rota.

**Decisão de escopo / lacuna conhecida (não resolvida de propósito):** a **lista** de notificações **não se atualiza sozinha**; só o número do sino (via polling). Para ver uma notificação nova na lista, a pessoa clica em "Atualizar".

### Parte A — Backend
- [x] Constantes (`NOTIFICATION.TYPES`, `REPORT.REASONS`), dois models e cinco associações
- [ ] Tabelas, índices, ENUM e chaves estrangeiras conferidos no banco (print banco-notificacoes.jpg)
- [x] Módulo de notificações (model, service, controller, routes), registrado no `app.js`
- [x] Módulo de denúncias (model, validator, service, controller, routes), registrado no `app.js`
- [x] As três ações criam o aviso dentro da transação, com o `t`; curtir e seguir também o apagam ao desfazer
- [x] Exclusão do treino limpa denúncias e notificações, antes do `destroy` do treino
- [x] `cors` antes do `express.json()` no `app.js`
- [ ] Teste de controle feito e descrito, as duas partes (prints controle-reports.jpg e controle-orfa.jpg)
- [ ] Os onze testes da Etapa 5 executados com sucesso (um print de cada curl)

### Parte B — Frontend
- [x] Constantes (`NOTIFICATIONS`, `NOTIFICATION_TEXT`, `REPORT_REASONS`), os dois services e a store com polling
- [x] `removeEventListener` recebe a mesma referência do `addEventListener`
- [x] Sino na Navbar: só logado, selo só com não lidas, `99+`, `aria-label` com o número
- [ ] O número se atualiza sozinho; um só temporizador depois de logins e logouts repetidos; nenhuma requisição ao sair (prints sino-contador.jpg e polling-network.jpg)
- [x] Tela de Notificações: lista paginada, estado vazio, "Atualizar", "Carregar mais", não lidas em destaque
- [x] Marcar como lida com `runOptimistic` (quarto caso, sem alterar `utils/optimistic.js`), undo relativo, cerca por linha
- [ ] Marcar como lida testada no navegador (otimista, rollback com toast, clique duplo, duas linhas) (prints otimista-lida.jpg e rollback-lida.jpg)
- [x] Modal de denúncia (cinco rádios, motivo obrigatório, erro dentro do modal, toast de sucesso); o dono não vê o botão
- [ ] Denúncia testada no navegador (prints denuncia-modal.jpg, denuncia-409.jpg e denuncia-toast.jpg)
- [x] Logout corrigido (`undefined` no lugar de `null`)
- [ ] Logout com o Console limpo (print console-logout.jpg)
- [ ] Teste prático completo (os nove passos), a partir do login, sem digitar nenhuma URL
