## Atividade 15 — Painel de Administração (API + Frontend)

### Ficha (nomes do meu projeto)
Entidade = **treino** (`Workout`, `workoutId`) · rotas do painel: `GET /api/admin/workouts` e `DELETE /api/admin/workouts/:id` · função de excluir: `workoutService.deleteWorkout(id, userId, isAdmin)` · campo de busca: `title` · telas: `AdminDashboardView`, `AdminReportsView`, `AdminUsersView`, `AdminTreinosView` (rotas `admin-dashboard`, `admin-reports`, `admin-users`, `admin-treinos`) · chaves do token: `fittrack_token` / `fittrack_user`.

### Checagem de alcançabilidade (antes de programar o front)

| Peça | Caminho(s) de clique |
|---|---|
| Painel de administração | barra lateral → seção **Administração** (só admin) → "Painel de administração" (`/admin`, que **redireciona** para o Dashboard) |
| Denúncias | aba **Denúncias** **e** o cartão vermelho de pendentes do Dashboard |
| Usuários / Treinos | as abas do painel |
| Revisar / Bloquear / Excluir | botões na linha (Bloquear e Excluir abrem confirmação; **Desbloquear** é direto) |
| Filtrar / buscar | grupo de botões (Denúncias); campo com *debounce* (Usuários e Treinos) |
| Ver o treino / o perfil | miniatura ou título (Denúncias e Treinos); `@usuário` (Usuários) |

Verificação no projeto (o que faltava e foi ajustado): o `router/index.js` tinha quatro rotas planas `admin-*` com `requiresAdmin`, mas a quarta era **`admin-categorias`** (Gerenciar Categorias), que não existe nesta atividade. Ela virou **`admin-reports`** (`AdminReportsView.vue`, renomeada com `git mv`). A barra lateral tinha **quatro** links de admin por caminho fixo (`/admin`, `/admin/treinos`, `/admin/categorias`, `/admin/usuarios`); `/admin/categorias` deixaria de existir, então a seção ficou com **um** link, para `/admin`. A guarda por papel antes mandava para `landing`; agora mostra o aviso e manda para o `feed`.

**Limitação conhecida (não resolvida de propósito):** a paginação por `offset` **pula itens** quando a lista muda entre uma página e a seguinte (ex.: revisar uma denúncia com o filtro "Pendentes" faz as seguintes subirem uma posição, e "Carregar mais" não traz a que ficou para trás). O conserto (paginação por cursor) fica para a Aula 18. "Atualizar" recomeça a lista e traz o item de volta.

### Parte A — Backend
- [x] Constantes (`REPORT.STATUS`, `ADMIN.REPORT_FILTERS`), model com `status`/`reviewedAt` e índice `idx_reports_status`
- [x] Banco com `status` e `reviewed_at`; denúncias antigas `pending` (ver `transcricao-testes-api.txt`, seção BANCO) — *print banco-denuncias.jpg: gerar no cliente de banco*
- [x] `isAuthenticated` assíncrono, consultando o banco, e `isAdmin` exportados; rotas antigas continuam funcionando sem alteração (o export padrão do `auth.js` segue sendo o `isAuthenticated`)
- [x] Login de bloqueado → `403` (e a senha **errada** de um bloqueado continua com a mensagem genérica, `401`)
- [x] `utils/escapeLike.js` extraído; `scripts/setAdmin.js` promovendo e rebaixando
- [x] Quatro arquivos em `modules/admin/`, registrados no `app.js`; `GET /api/admin/dashboard` sem token → `401` (não `404`)
- [x] A exclusão do painel não tem `destroy` novo: reaproveita `deleteWorkout(id, userId, true)` (o contador que cai é o do **dono** do treino)
- [x] Os dois testes de controle feitos, desfeitos e descritos (bloqueado com token antigo → `200`; usuário comum no dashboard → `200`)
- [x] Os nove testes da Etapa 5 executados com sucesso (ver `transcricao-testes-api.txt`) — *prints .jpg dos curl: gerar a partir da transcrição*

### Parte B — Frontend
- [x] `REPORT_FILTERS`, `adminService.js` (sete chamadas, sem `silent`, `patch` sem 2º argumento), `usePaginatedList` com `watch` e guarda contra resposta velha, `ConfirmModal`
- [x] `usePaginatedList` testado (jsdom): resposta velha descartada ao trocar o filtro; `loadMore` velho descartado; `reload` ok; Feed/Seguindo/Notificações usam o mesmo composable sem alteração de chamada
- [x] `AdminLayout` + rotas filhas de `/admin` (`redirect` e `meta` no pai); guarda por papel no `beforeEach`
- [x] Dashboard (cartões + cartão vermelho das pendentes), Denúncias (filtro, revisar que espera o servidor), Usuários (busca, bloquear/desbloquear), Treinos (busca, excluir) — todas com ações que esperam o servidor
- [x] `vite build` sem erros
- [ ] Teste prático completo no navegador (os nove passos da Etapa 5): guarda, experimento do `localStorage`, rebaixar com o painel aberto, Slow 3G / Offline, "pulo" com `PAGE_SIZE = 2`, bloqueio com duas janelas, regressão e sessão expirada
- [ ] Prints do navegador (`guarda-comum.jpg`, `guarda-localstorage.jpg`, `dashboard.jpg`, `denuncias-lista.jpg`, `revisar-lenta.jpg`, `pulo-paginacao.jpg`, `usuarios-busca.jpg`, `bloquear-modal.jpg`, `bloqueado-login.jpg`, `itens-excluir.jpg`)
