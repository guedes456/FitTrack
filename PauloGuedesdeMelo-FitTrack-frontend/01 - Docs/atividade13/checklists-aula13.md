## Atividade 13 — Rotinas (muitos-para-muitos), "Salvar" e Busca com Debounce

### Contextualização e alcançabilidade (antes de programar)

Nomes da minha ficha: coleção = **Rotina** · junção = **RoutineWorkout** (`routine_workouts`) ·
contador = **treinosCount** · rotas `/api/my-routines`, `/api/routines`,
`/api/workouts/:workoutId/routines-status` · `hasWorkout` · telas `MyRoutinesView`,
`RoutineDetailView`, `SearchView` · a busca procura no `title` do treino e em
`username` / `fullName` do usuário.

| Peça | Caminho(s) de clique | Já existia? |
|---|---|---|
| Minhas Rotinas | item "Minhas Rotinas" no **menu do avatar** e item na **Sidebar** | não, os dois são novos |
| Criar / excluir rotina | botão "Nova rotina" e botão "Excluir" na própria tela (modal / confirmação) | não |
| Detalhe da rotina | clique no **cartão** (stretched-link), na lista de Minhas Rotinas | não |
| Salvar um treino | botão **"Salvar"** no Detalhe do treino (visitante → login → volta ao treino) | não |
| Remover treino da rotina | botão "Remover da rotina" em cada card, no detalhe (só a dona) | não |
| Busca | **barra da Navbar** (Enter) **e** item "Explorar" da Sidebar | a rota `/busca` (nome `search`) já existia como tela "em construção" |

Verificações no `router/index.js`: as três telas têm rota (`my-routines` com
`requiresAuth`, `routine-detail` **sem** `requiresAuth` (pública) e `search`
(`/busca`, sem `requiresAuth`)); o `router.push({ name: 'search', ... })` da
Navbar usa o mesmo nome; todos os caminhos do `TheSidebar.vue` existem no router.

**Lacuna conhecida (decisão de escopo, não resolvida):** a rotina **pública** de
outra pessoa só é alcançável **por link**; nenhuma tela lista as rotinas públicas
de alguém (nem o Perfil público, nem a busca).

### Parte A — Backend
- [x] Constantes de validação e de busca criadas (`ROUTINE_TITLE_MIN/MAX`, `ROUTINE_DESCRIPTION_MAX`, `SEARCH`)
- [x] `utils/parseId.js` criado e usado pelo `followController` (sem a função antiga)
- [x] Dois models (`Routine`, `RoutineWorkout`) e seis associações
- [x] Tabelas, índices e chaves estrangeiras conferidos no banco (print colecoes-banco.jpg)
- [x] Quatro arquivos do módulo `routine`, registrados no `app.js`
- [x] Duas escritas (linha + contador) numa só transação, nas três operações
- [x] 403 para privada de outra pessoa; `isOwner` correto para dona, outra pessoa e visitante
- [x] Busca consultando o banco, com escape, `Promise.all` e entrada tratada
- [x] Controller `async`/`await` e rota com `asyncHandler`
- [x] Exclusão do treino limpa a junção **e** desconta o contador de cada rotina, na mesma transação
- [ ] Teste de controle feito e descrito (prints contador-controle.jpg e contador-certo.jpg)
- [x] Os onze testes da Etapa 6 executados com sucesso (um print de cada curl)

### Parte B — Frontend
- [x] Constantes, service com as sete funções; a Home já estava limpa (a `LandingView` só consulta o status da API, não chama `search`)
- [x] `runOptimistic` criado
- [x] Os dois botões (curtir e seguir) refatorados para usá-lo, sem mudar o `<template>` nem a cerca
- [ ] Os dois botões testados no navegador, sem regressão (otimista, Offline com rollback, visitante)
- [x] Modal de criação, lista e detalhe implementados, com 403 / 404 na própria tela
- [x] Cartão clicável (`stretched-link`) com botão "Excluir" por cima
- [x] Modal de criação, lista e detalhe testados no navegador (colecao-privada.jpg, detalhe-colecao.jpg, colecao-privada-visitante.jpg)
- [x] Modal "Salvar" com caixas marcadas conforme o servidor, otimista por linha, com rollback e cerca por linha
- [x] Botão "Salvar" no Detalhe, com o comportamento do visitante
- [ ] Modal "Salvar" testado no navegador (Slow 4G, Offline, dois cliques rápidos)
- [x] `useDebouncedValue`, `SearchView` com o termo na URL (`?q=`), barra de busca na Navbar e "Minhas Rotinas" no menu do avatar e na Sidebar
- [ ] Digitar uma palavra inteira sem pausa gera **uma** requisição (Network); F5 e link funcionam; Voltar não passa por cada pausa
- [ ] Teste prático completo (os seis passos), sem digitar nenhuma URL
