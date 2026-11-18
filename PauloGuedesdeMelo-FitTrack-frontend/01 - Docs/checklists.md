# Checklists — Atividade Aula 01 (FitTrack)

## PARTE A — Backend

### Etapa 1 — Setup
- [x] node -v e npm -v conferidos
- [x] Pasta fittrack-api criada, separada da pasta do front
- [x] package.json gerado com npm init -y

### Etapa 2 — Dependências e scripts
- [x] express, cors, dotenv, morgan instalados como dependências
- [x] nodemon instalado como devDependency
- [x] Scripts start e dev configurados no package.json

### Etapa 3 — Estrutura de pastas
- [x] Pastas bin/, config/, middlewares/, modules/, routes/ criadas
- [x] .gitignore criado com node_modules/ e .env

### Etapa 4 — Padrão de resposta
- [x] middlewares/apiResponse.js criado com as funções success e error

### Etapa 5 — Rota GET /api
- [x] routes/index.js criado, com name/message adaptados ao FitTrack
- [x] Campo data.status escrito exatamente assim (minúsculo, sem variação)

### Etapa 6 — CORS
- [x] .env criado com PORT e CORS_ORIGIN corretos

### Etapa 7 — app.js e bin/www
- [x] app.js criado, montando indexRouter sob o prefixo /api
- [x] bin/www criado
- [x] npm run dev sobe o servidor sem erros, exibindo a mensagem de confirmação

### Etapa 8 — Teste isolado
- [x] curl http://localhost:3000/api responde o JSON esperado
- [x] Print curl-api.jpg

## PARTE B — Frontend

### Etapa 1 — Criação do projeto
- [x] Projeto criado com npm create vite@latest fittrack-frontend -- --template vue
- [x] npm install executado com sucesso
- [x] npm run dev abriu a página em http://localhost:5173

### Etapa 2 — Pastas e variáveis de ambiente
- [x] Estrutura de pastas criada (views, components, router, services, stores)
- [x] HelloWorld.vue removido e style.css limpo
- [x] .env criado com VITE_API_URL apontando para a API
- [x] .gitignore configurado

### Etapa 3 — Vue Router
- [x] Tabela "funcionalidade → tela" preenchida (Funcionalidades-e-Telas.md)
- [x] Uma tela placeholder criada para cada linha da tabela
- [x] src/router/index.js criado com todas as rotas do sistema
- [x] Router registrado em main.js
- [x] Navegando manualmente pela URL, cada rota carrega a tela correspondente

### Etapa 4 — Layout base
- [x] TheNavbar.vue, TheSidebar.vue e TheFooter.vue criados, com links
- [x] Layout montado em App.vue, com <router-view /> no lugar certo
- [x] Ao navegar entre rotas, Navbar/Sidebar/Footer permanecem fixos

### Etapa 5 — Integração com a API (marco visual)
- [x] LandingView.vue consumindo VITE_API_URL e exibindo json.data.status
- [x] Landing Page exibindo "Status da API: online" com dados reais da API
- [x] Print landing-status.jpg
- [x] Erro de CORS reproduzido intencionalmente (CORS_ORIGIN alterado para porta errada, API reiniciada, erro "blocked by CORS policy" capturado no Console do DevTools)
- [x] Erro de CORS corrigido depois (CORS_ORIGIN revertido para localhost:5173, API reiniciada, Landing voltou a mostrar "online")
- [x] Print errocors.jpg

## Atividade 06 — Checkpoint 1: Componentização, useAuth() e Acerto de Contas Visual

### Parte A — Backend (sem código novo)
- [x] checkpoint-01.md criado e respondido (01 - Docs/atividade06/)
- [x] Todos os endpoints já construídos continuam respondendo como esperado

### Parte B — Frontend
- [x] bootstrap-icons incluído via CDN
- [x] Componentes-base criados em src/components/base/ (BaseInput, BaseButton, FormCard)
- [x] Registro, Login e Edição de Perfil refatorados para usar BaseInput/BaseButton/FormCard
- [x] Tela de Registro estilizada, consistente com Login/Perfil (mesma cor de marca, sem cor nova)
- [x] composables/useAuth.js criado
- [x] Guarda de rota atualizado para usar useAuth()
- [x] Navbar atualizada para usar useAuth()
- [x] Sidebar revisada, escondendo links de rotas protegidas/admin quando o usuário não tem acesso
- [x] Nenhum link novo aponta para funcionalidade ainda não construída

### Checklist de testes
- [x] Cadastro → redireciona ao Login, com a tela agora estilizada
- [x] Login → redireciona à tela principal (feed)
- [x] Navbar → troca correta entre estado logado/deslogado
- [x] Edição de Perfil → dados reais, edição e upload de foto continuam funcionando via componentes-base
- [x] Guarda de rota → deslogado, acesso direto a rota protegida redireciona ao Login
- [x] Console do DevTools sem erro novo durante os testes

## Atividade 07 — Upload da Entidade Principal (Workout) com Indicador de Progresso

### Parte A — Backend
- [x] Pasta de upload da entidade criada (public/uploads/workouts/)
- [x] TITLE_MAX (e DESCRIPTION_MAX) adicionados a VALIDATION
- [x] Model Workout criado (Grupo B: campo `image` único)
- [x] config/associations.js criado (User hasMany Workout / Workout belongsTo User)
- [x] Middleware de upload (workoutMulter, multer.single('image')) criado
- [x] workoutValidator, workoutService, workoutController e workoutRoutes criados
- [x] Ordem de middlewares conferida: auth -> multer -> validator -> controller
- [x] Rota POST /api/workouts montada em app.js
- [x] config/associations carregado antes do sync
- [x] Tabela `workouts` confirmada no banco, com FK

### Checklist desta etapa (Parte A)
- [x] Upload completo funciona e treinosCount sobe (curl-upload.jpg: 201)
- [x] Cada um dos quatro casos de erro é recusado com o status esperado (curl-upload.jpg e curl-formato-invalido.jpg)

### Parte B — Frontend
- [x] workoutService.js criado, recebendo onUploadProgress como parâmetro
- [x] .progress-bar e .thumbnail-preview adicionadas ao CSS (assets/main.css)
- [x] Formulário completo (título, descrição, imagem) usando BaseInput/BaseButton/FormCard
- [x] Barra de progresso implementada (onUploadProgress -> uploadPercent)
- [x] Prévia de imagem implementada (URL.createObjectURL, sem chamada de rede)
- [x] Link "Upload" na Sidebar, visível só para autenticados (já existia, agora aponta pra tela real)
- [x] Resposta ao checklist de alcançabilidade escrita (atividade07/resposta-alcancabilidade.md)

### Checklist de testes (Parte B) — testar localmente e tirar prints
- [x] Login -> link Upload -> URL muda sem recarregar (link-envio.jpg, envio-vazio-erros.jpg)
- [x] Envio vazio -> erros de campo obrigatório (envio-vazio-erros.jpg)
- [x] Arquivo selecionado -> prévia aparece sem chamada de rede (formulario-preenchido.jpg)
- [x] Envio -> barra de progresso avança -> mensagem de sucesso (progresso-upload.jpg)
- [x] DevTools Network -> Content-Type: multipart/form-data; boundary=... (upload-multipart.jpg)
- [x] Banco/Postman -> registro criado e treinosCount subiu (banco-contador.jpg)

## Atividade 12 — Checkpoint 2 (Leitura crítica, constantes, useAsyncData, toasts e regressão)

### Parte A — Backend
- [x] checkpoint-02.md criado, com as respostas dos Blocos 2.1 a 2.6 e as três perguntas extras
- [x] Problema de paginação reproduzido e anotado antes da correção (paginacao-antes.jpg e paginacao-antes-filtrado.jpg)
- [x] PAGINATION e utils/pagination.js criados e usados nos dois controllers e nos dois services
- [x] Testes do Bloco 3.4 com o resultado esperado (paginacao-depois.jpg e paginacao-depois-filtrado.jpg)
- [x] workoutService.createWorkout dentro de uma transação, com { transaction: t } nas duas escritas
- [x] Criação testada: 201 e treinosCount incrementado (curl-transacao-1.jpg e curl-transacao-2.jpg)
- [x] Bateria de regressão da API (Bloco 4) sem regressão (curl-regressao-1 a 4.jpg e curl-ids-invalidos.jpg)

### Parte B — Frontend
- [x] constants.js criado, com limites iguais aos da API
- [x] api.js, stores/auth.js e os services de feed usam as constantes
- [x] useToast e ToastContainer criados; container montado uma vez em App.vue
- [x] Interceptor com notifyIfNeeded; silent apenas nos formulários (login, cadastro, logout, perfil, upload, edição e comentário)
- [x] Toasts testados: formulario-sem-toast.jpg, toast-erro.jpg, toast-modal.jpg e toast-sucesso.jpg
- [x] useAsyncData e usePaginatedList criados e usados nas oito telas de leitura, sem apiErrorMessage sobrando
- [ ] Cada tela testada individualmente no navegador
- [x] Decisão registrada: MyProfileView, UploadView, EditWorkoutView, LoginView e RegisterView ficam fora dos composables de leitura (a tela existe para preencher um formulário; o carregamento inicial é só para preencher os campos e a falha é da tela de edição)
- [x] useAuthenticatedAction criado e usado em LikeButton e FollowButton, sem errorMessage local
- [x] Três cliques rápidos com Slow 4G geram uma requisição (uma-requisicao.jpg)
- [x] Nenhum limite solto nos formulários (LIMITS.*)
- [ ] Teste de regressão completo (Bloco 11) com conta nova, sem erros vermelhos no Console

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
