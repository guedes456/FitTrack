# Checklists — Atividade Aula 10 (FitTrack)

> Curtidas e Comentários na Entidade Principal (Workout)
>
> Nomes usados: `likesCount` e `commentsCount` (colunas no model Workout) e `workoutId` (chave estrangeira nas tabelas `likes` e `comments`).

### Parte A — Backend
- [x] COMMENT_MAX e as duas colunas de contador adicionadas
- [x] Models Like e Comment criados, com o índice único composto (user_id, workout_id) no Like
- [x] Associações nos dois sentidos (config/associations.js)
- [x] Tabelas e colunas conferidas no banco
- [x] Módulo like completo (3 rotas) e registrado no app.js
- [x] Módulo comment completo (2 rotas, validador com trim primeiro) e registrado
- [x] Todas as escritas duplas (linha + contador) dentro de transação
- [x] Detalhe devolvendo isLiked (e os contadores)
- [x] Exclusão em transação, com limpeza de curtidas e comentários
- [x] Contadores no perfil público
- [x] trim() movido para o início nos campos obrigatórios (usuário, nome completo, bio, título, descrição)

### Checklist dos testes (Parte A) — curl, um print de cada
- [x] Curtir sem token 401; treino inexistente 404
- [x] B curte 201 (liked true, 1); B de novo 200 (false, 0); de novo 201 (1); A curte (2)
- [x] like-status com e sem token e isLiked no detalhe: visitante false; B true
- [x] No banco, inserir uma curtida repetida à mão: o banco recusa (unique.jpg)
- [x] liked-workouts com B: os itens, cada um com o autor; sem token 401
- [x] Comentar: sem token 401; só espaços 400; 501 caracteres 400; treino inexistente 404; sucesso 201 com texto aparado e autor
- [x] Listar comentários sem token 200, mais novos primeiro; contador no detalhe igual ao número de itens
- [x] Excluir treino com curtidas e comentários: 200; nenhuma linha restante em likes/comments; arquivo removido; contador do usuário decrementado
- [x] Título só com espaços: 400 depois da correção
- [x] Regressão: upload, detalhe, feed, edição e perfil como antes

### Parte B — Frontend
- [x] Dois services (likeService.js e commentService.js) criados
- [x] Formatador (utils/format.js) criado
- [x] CSS criado
- [x] LikeButton com atualização otimista, rollback e isBusy
- [x] Visitante é levado ao login e volta
- [x] Lista de comentários com carregando/erro/vazio; formulário validado
- [x] Comentário novo no topo, sem recarregar a lista
- [x] Texto escapado ({{ }}) e quebras de linha preservadas (white-space: pre-line)
- [x] Detalhe com curtir + comentários
- [x] Contadores no card
- [x] Tela de itens curtidos com rota (/curtidos), acessível pelo menu do avatar e pela Sidebar

### Checklist de testes (Parte B) — testar localmente e tirar prints
- [x] Visitante (janela anônima): vê o botão e a lista, sem formulário; curtir leva ao login e volta ao detalhe
- [x] Logado: curtir muda o coração na hora; F5 mantém; descurtir desfaz
- [x] Slow 4G: o coração muda imediatamente (otimista.jpg); Offline: o coração muda, volta atrás e a mensagem de erro aparece (rollback.jpg)
- [x] Comentar: vazio, só espaços e mais de 500 caracteres geram erro sem chamar a API; comentário válido de duas linhas aparece no topo com as linhas preservadas, e o contador sobe
- [x] Comentário <b>teste</b> <img src=x onerror="alert(1)"> aparece como texto, sem negrito e sem alerta
- [x] Contadores aparecem no card do Feed, do Perfil e de Meus Itens, atualizados
- [x] Pelo menu/Sidebar, a tela de itens curtidos abre; descurtir no detalhe tira o item da lista (curtidos.jpg)
- [x] Como A, excluir um item com curtidas e comentários funciona, e o item some da lista de curtidos de B
- [x] Regressão: Feed, Perfil, Meus Itens (editar/excluir), Upload, Login/Logout
