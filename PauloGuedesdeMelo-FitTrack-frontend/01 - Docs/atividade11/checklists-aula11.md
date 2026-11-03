# Checklists — Atividade Aula 11 (FitTrack)

> Seguir Pessoas, Seguidores/Seguindo e o Feed de Quem Eu Sigo
>
> Nomes usados: `followersCount` e `followingCount` (model User); feed filtrado em `/api/following-workouts` (`getFollowingWorkouts`); tela do feed em `/feed/seguindo`.

### Parte A — Backend
- [x] followModel.js criado, com os dois índices (único composto `follower_id, following_id` + simples em `following_id`)
- [x] Associações com apelidos (`Follower` / `Following`) declaradas
- [ ] Tabela e índices conferidos no banco (print follows.jpg)
- [x] Três arquivos do módulo follow (service, controller, routes), registrados no app.js
- [x] parseUserId convertendo o id na borda (400 para inválido)
- [x] Três escritas (linha + dois contadores) numa só transação
- [x] Feed filtrado com Op.in, paginado, devolvendo vazio para quem não segue ninguém
- [x] isFollowing no perfil público

### Checklist dos testes (Parte A) — curl, um print de cada
- [ ] toggle-follow sem token 401; id abc 400; a si mesmo 400; usuário 99999 404
- [ ] A segue B 201 (1); A de novo 200 (0); de novo 201 (1); C segue B (2); B segue A
- [ ] Contadores: B com 2 seguidores e 1 seguindo; A com 1 e 1; C com 0 e 1
- [ ] follow-status e isFollowing: visitante false; A vendo B true; C vendo A false; B vendo B false (isOwner true)
- [ ] followers de B (C e A, mais recente primeiro); following de A; sem password; inexistente 404
- [ ] Feed filtrado: sem token 401; A vê só itens de B; ?page=2&limit=1 vazio; quem não segue ninguém, vazio
- [ ] No banco, linha repetida em follows é recusada
- [ ] Regressão: curtir, comentar, upload, edição, exclusão e GET /feed

### Parte B — Frontend
- [x] Alcançabilidade respondida (atividade11/resposta-alcancabilidade.md) e link da Sidebar conferido
- [x] followService.js criado
- [x] FollowButton com defineModel, otimista, com rollback e isBusy
- [x] Sem a leitura de `following.value` logo após atribuir (variável local `nowFollowing`)
- [x] Perfil público com FollowButton ligado por v-model; contador do cartão muda junto
- [x] Números "seguidores"/"seguindo" do perfil viram links
- [x] Uma tela de lista (FollowListView), duas rotas, abas
- [x] Feed filtrado com rota e acessível pela Sidebar, com "Carregar mais"

### Checklist de testes (Parte B) — testar localmente e tirar prints
- [ ] Visitante (janela anônima): botão aparece; clique leva ao login e volta ao perfil
- [ ] Logado: Seguir muda botão e contador na hora (seguindo.jpg); F5 mantém; Seguindo desfaz
- [ ] Slow 4G: mudança instantânea (otimista.jpg); Offline: muda, volta atrás e mostra erro (rollback.jpg)
- [ ] Contador nunca vai a -1
- [ ] No meu perfil não há botão de seguir; os números são links
- [ ] Seguidores ↔ Seguindo (abas) sem recarregar (seguidores.jpg); clicar numa pessoa leva ao perfil; usuário inexistente mostra erro; listas vazias mostram a mensagem
- [ ] Trocar de uma pessoa que sigo para uma que não sigo: o botão reflete a pessoa nova
- [ ] Pela Sidebar, feed filtrado mostra só itens de quem sigo (feed-seguindo.jpg); deixar de seguir tira os itens
- [ ] Regressão: Perfil (editar, itens), Feed, Detalhe (curtir/comentar), Meus Treinos, Curtidos, Login/Logout
