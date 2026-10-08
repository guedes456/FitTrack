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

## Atividade 08 — Detalhe da Entidade Principal e Feed Paginado (Grupo B: sem streaming)

> Itens de streaming (rota `/stream`, `Range`, `206`, player) não se aplicam: o projeto é Grupo B (a imagem é o próprio treino).

### Parte A — Backend
- [x] middlewares/optionalAuth.js criado
- [x] getWorkoutDetails / getFeedWorkouts adicionados ao workoutService
- [x] Controller e rota do detalhe criados, com optionalAuth (GET /api/workouts/:id)
- [x] Coluna de visualizações criada (`viewsCount` -> `views_count` no model Workout)
- [x] getFeed adicionado a userController.js / userRoutes.js (GET /api/feed, isAuthenticated)

### Checklist dos testes (Parte A) — curl, um print de cada
- [x] Detalhe sem token -> 200, isOwner: false, viewsCount em 1
- [x] Detalhe com o token do dono -> 200, isOwner: true, viewsCount em 2
- [x] Detalhe de um item inexistente -> 404
- [x] Feed sem token -> 401
- [x] Feed com token, ?page=1&limit=1 -> um item só
- [x] Feed com token, ?page=2&limit=1 -> o próximo item (ou lista vazia se só houver um)

### Parte B — Frontend
- [x] getWorkoutImageUrl adicionada a utils/media.js (aponta para /uploads/workouts, nunca para a API)
- [x] Classes de card (.workout-grid, .workout-card, .workout-card-img com proporção 4:3) e .workout-detail-img adicionadas ao CSS
- [x] getWorkoutById e getFeed criadas no userService.js
- [x] Componente de card criado (components/workout/WorkoutCard.vue)
- [x] Tela de Feed exibindo itens reais, com paginação "Carregar mais"
- [x] Tela de Detalhe exibindo a imagem em resolução real (sem player)
- [x] isOwner recebido da API e guardado no estado da tela (sem uso visual até a Aula 09)

### Checklist de testes (Parte B) — testar localmente e tirar prints
- [x] Login -> link do Feed na Navbar/Sidebar -> itens reais aparecendo (feed-real.jpg)
- [x] Clicar num card -> navega para o detalhe sem recarregar a página
- [x] Detalhe: imagem carrega em resolução real, maior que a miniatura do card (detalhe-real.jpg)
- [x] F5 no detalhe -> curl em GET /api/workouts/:id mostra viewsCount subindo
- [x] Acessar um id inexistente pela URL -> mensagem de erro, sem a tela quebrar
