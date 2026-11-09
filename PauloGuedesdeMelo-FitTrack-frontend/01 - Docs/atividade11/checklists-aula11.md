# Checklists — Atividade Aula 11 (FitTrack)

> Seguir Pessoas, Seguidores/Seguindo e o Feed de Quem Eu Sigo
>
> Nomes usados: `followersCount` e `followingCount` (já existiam no model User, desde a Atividade 02) e rota do feed filtrado `/api/following-workouts`.

## Checagem de alcançabilidade (antes de programar)

| Peça | Caminho de clique |
|---|---|
| Seguir / deixar de seguir | Botão no perfil público de outra pessoa (Feed → clicar no autor de um card → perfil). Visitante: clica, vai ao login e volta ao perfil. |
| Listas de seguidores/seguindo | No perfil, os números "seguidores" e "seguindo" são links; dentro das listas há abas entre as duas e o link "Voltar ao perfil". |
| Feed de quem eu sigo | 1 clique no item **"Feed Seguindo"** da Sidebar. |

Verificação do link da Sidebar: o `TheSidebar.vue` já apontava "Feed Seguindo" para `/feed/seguindo`, e o `router/index.js` já tinha esse mesmo path (rota `feed-following`, com um placeholder). Nenhum dos dois precisou ser ajustado; só troquei o placeholder `FeedFollowingView.vue` pela tela real.

### Parte A — Backend
- [x] followModel.js criado, com os dois índices (único `follower_id + following_id` e simples `following_id`)
- [x] Associações com apelidos declaradas (`Follower` e `Following`) em config/associations.js
- [x] Tabela e índices conferidos no banco
- [x] Três arquivos do módulo follow (service, controller e routes), registrados no app.js
- [x] parseUserId convertendo o id na borda (controller)
- [x] Três escritas (linha + dois contadores) numa só transação, todas com { transaction }
- [x] Feed filtrado com Op.in, paginado, devolvendo vazio para quem não segue ninguém
- [x] isFollowing no perfil público

### Checklist dos testes (Parte A) — curl, um print de cada
- [x] toggle-follow: sem token 401; id abc 400; seguir a si mesmo 400; usuário 99999 404
- [x] A segue B 201 (1); A de novo 200 (0); de novo 201 (1); C segue B (2); B segue A
- [x] Contadores dos dois lados: B 2 seguidores e 1 seguindo; A 1 e 1; C 0 e 1
- [x] follow-status e isFollowing no perfil: visitante false; A vendo B true; C vendo A false; B vendo o próprio false (isOwner true)
- [x] followers de B (C e A, mais recente primeiro); following de A; sem password; usuário inexistente 404
- [x] Feed filtrado: sem token 401; A vê só os itens de B; ?page=2&limit=1 vazio; quem não segue ninguém, vazio
- [x] No banco, linha repetida em follows é recusada (follows.jpg)
- [x] Regressão: curtir, comentar, upload, edição, exclusão e GET /feed

### Parte B — Frontend
- [x] followService.js criado
- [x] FollowButton com defineModel, otimista, com rollback e isBusy
- [x] Sem a leitura "logo após atribuir" (usa a variável local nowFollowing)
- [x] Perfil público: botão ativo, com o contador do cartão mudando junto
- [x] Números do perfil viram links para as listas
- [x] Uma tela de lista (FollowListView), duas rotas, abas funcionando
- [x] Feed filtrado com rota e acessível pela Sidebar

### Checklist de testes (Parte B) — testar localmente e tirar prints
- [x] 1. Visitante: o botão aparece; o clique leva ao login e volta ao perfil
- [x] 2. Logado: "Seguir" muda botão e contador na hora; F5 mantém; "Seguindo" desfaz (seguindo.jpg)
- [x] 3. Slow 4G: mudança instantânea (otimista.jpg); Offline: muda e volta atrás, com mensagem de erro (rollback.jpg)
- [x] 4. O contador nunca vai para -1
- [x] 5. No meu perfil não há botão de seguir; os números são links
- [x] 6. Seguidores -> Seguindo (aba) sem recarregar; clicar numa pessoa leva ao perfil; usuário inexistente mostra erro; listas vazias mostram mensagem (seguidores.jpg)
- [x] 7. De uma pessoa que sigo para uma que não sigo: o botão reflete a pessoa nova
- [x] 8. Pela Sidebar, o feed filtrado mostra só itens de quem sigo; deixar de seguir tira os itens (feed-seguindo.jpg)
- [x] 9. Regressão: Perfil, Feed, Detalhe (curtir/comentar), Meus Itens, Curtidas, Login/Logout
