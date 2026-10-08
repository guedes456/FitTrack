# Checklists — Atividade Aula 08 (FitTrack)

> Detalhe da Entidade Principal e Feed Paginado (Grupo B: sem streaming)

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
