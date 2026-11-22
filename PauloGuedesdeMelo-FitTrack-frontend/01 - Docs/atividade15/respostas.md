# Respostas — Atividade Aula 15 (Painel de Administração)

Na minha ficha: entidade = **treino** (`Workout`); denúncia = `Report` (tabela `reports`); telas = `AdminDashboardView`, `AdminReportsView`, `AdminUsersView`, `AdminTreinosView`; rotas do painel = `/api/admin/dashboard`, `/reports`, `/users`, `/workouts`.

> Nota: as respostas 8 (controles da API) e as partes de API das respostas 6 e 9 vêm de testes que **rodei** (transcrição em `transcricao-testes-api.txt`). O que depende do navegador (experimento do `localStorage`, o "pulo" com `PAGE_SIZE = 2`, o bloqueio nas duas janelas) está explicado pelo funcionamento do código; confira e complemente com o que você vir nos prints.

**1. Autenticação × autorização, e 401 × 403**

Autenticação responde "quem é você?" (o token é válido e a conta existe); autorização responde "você pode fazer isto?". Quando a **identidade** falha, a API responde **401**: sem token, token inválido ou expirado, conta apagada ou **bloqueada** (ex.: `GET /api/profile/me` com o token de um bloqueado → 401 "Sua conta foi bloqueada..."). Quando a identidade está certa mas falta **permissão**, responde **403**: o `403` de dono da Aula 09 (um usuário comum chama `DELETE /api/workouts/2` num treino que não é dele → "Você não tem permissão para alterar este treino.") e o de papel de hoje (um usuário comum chama `GET /api/admin/dashboard` → "Acesso restrito a administradores.").

**2. Por que o `isAuthenticated` passou a consultar o banco**

O `isAdmin` dentro do token é uma foto do momento do login e o token vale até expirar (1 dia). Sem consultar o banco: um usuário **bloqueado** continua usando a API com o token antigo (no teste de controle (a), com o `if (user.isBlocked)` comentado, o token de B bloqueado respondeu **200**); um administrador **rebaixado** continua mandando no painel até o token vencer; e uma conta **apagada** continua "existindo" para a API. Consultando o banco a cada requisição, o bloqueio, o rebaixamento e a exclusão valem **na hora** (testei: `setAdmin adm off` e o **mesmo** token passou a dar 403; promovendo de novo, voltou a 200; e o token emitido **antes** da promoção já abriu o dashboard). O **custo** é uma consulta por chave primária em toda rota autenticada. As outras duas alternativas: **token de vida curta com refresh token** (a janela de erro cai para minutos) e **lista de tokens revogados** (tabela/cache de tokens invalidados, consultada a cada requisição).

**3. Como se vira administrador, e por que não existe uma rota**

Rodando no servidor `node scripts/setAdmin.js <username>` (e `... off` para rebaixar), que grava `isAdmin` direto no banco. Quem executa precisa ter acesso à máquina e ao `.env`, ou seja, já é de confiança. Uma rota `POST /make-admin` seria um alvo: qualquer pessoa que a alcançasse (ou que descobrisse como burlar a proteção dela) viraria administrador, e a proteção dessa rota teria o mesmo problema de "quem pode chamar?". Fora da API, o problema não existe.

**4. A guarda em uma linha e a ordem `isAuthenticated` → `isAdmin`**

`router.use('/admin', isAuthenticated, isAdmin)` protege **tudo** que começa com `/admin`, inclusive rotas que ainda nem existem: `GET /api/admin/rota-inexistente` respondeu 401 sem token e 403 com token comum, não 404. Com `isAdmin` em cada rota, bastaria esquecer um em uma rota nova para abrir um buraco. A ordem importa porque o `isAuthenticated` é quem monta o `req.user` (a partir do banco) e o `isAdmin` só **lê** o `req.user.isAdmin`; se o `isAdmin` viesse antes, `req.user` seria indefinido e **todos**, até o administrador, receberiam 403.

**5. A coluna `status` numa tabela com linhas, a revisão idempotente e o `reload()`**

Acrescentar uma coluna `NOT NULL` a uma tabela que já tem linhas exige um valor para as linhas antigas; sem o `defaultValue: 'pending'`, o `sync({ alter: true })` não conseguiria fazer o `ALTER`. Com ele, o banco preencheu as 3 denúncias antigas como `pending` (conferi com `GROUP BY status`). **Revisar é idempotente**: o service só escreve se a denúncia ainda não estava revisada; repetir devolve **200 com o mesmo `reviewedAt`** (testei com 2 s de intervalo) e ninguém sobrescreve a data da primeira revisão. O `reload()` depois do `save()` traz o valor que o banco realmente guardou (a data é arredondada para segundos); é ele que vai na resposta e que a tela exibe, em vez de um `new Date()` que difere do gravado.

**6. As duas checagens do bloqueio**

Há duas: o **login** (`loginUser`) e o **`isAuthenticated`**. O login responde **403** porque a identidade foi provada (a senha confere), mas a entrada é proibida; as rotas respondem **401** porque o token deixou de valer (a tela é levada ao Login, sem toast). No login, a checagem vem **depois** da senha: se viesse antes, qualquer pessoa descobriria quais e-mails têm conta e quais estão bloqueados sem saber a senha. Testado: bloqueado + senha certa → 403 com a mensagem do bloqueio; bloqueado + senha **errada** → 401 "E-mail ou senha inválidos." (mensagem genérica). O bloqueio **não** apaga nada nem esconde a pessoa: o perfil público de B continuou visível (200) e os treinos dele seguem no feed; ele só perde o acesso; ao desbloquear, o **mesmo** token voltou a funcionar.

**7. `escapeLike` já na Aula 15, e a contagem de denúncias sem `include` agrupado**

As buscas do painel (usuários e treinos) usam `LIKE` com texto digitado, e a busca pública já precisava do mesmo escape (`%%` casaria com tudo). Duas cópias da função divergiriam com o tempo; extrair para `utils/escapeLike.js` já agora evita a duplicação, e antes de existir uma terceira busca (Aula 18). A lista de treinos faz **duas consultas**: a página de treinos (com o autor) e, depois, uma consulta agrupada (`GROUP BY workout_id`, `Op.in` só com os ids da página, `raw: true`) das denúncias **pendentes**, juntada por um `Map`. Um `include` agrupado junto com `findAndCountAll` e `limit` bagunça o `count` e a paginação, e a segunda consulta é barata (só os ids da página).

**8. Os dois testes de controle**

(a) Comentei as três linhas do `if (user.isBlocked)` no `auth.js`, bloqueei B pelo painel e repeti uma rota autenticada com o token antigo dele: respondeu **200**. Prova que o `if` é **a** barreira do bloqueio nas rotas: sem ele, o bloqueio só valeria no login e quem já tem token continuaria entrando. Desfeito, voltou a 401. (b) Tirei o `isAdmin` do `router.use` e chamei `GET /api/admin/dashboard` com o token de um usuário **comum**: respondeu **200** com todos os números do sistema. Prova que o `isAuthenticated` sozinho só diz "quem é você" e que é o `isAdmin` que impede o usuário comum; o teste mostra o que vazaria. Desfeito, voltou a 403. (Prints `controle-bloqueio.jpg` e `controle-isadmin.jpg` a partir da transcrição.)

**9. O que a guarda de rota do front protege e o que não protege**

A guarda do `router.beforeEach` protege a **navegação** (conforto): quem não é administrador não vê as abas nem a seção na lateral e recebe o aviso e o Feed. Mas o `isAdmin` que ela lê vem do `localStorage` (`fittrack_user`), que qualquer pessoa edita no Console. No experimento: como usuário comum, editar `"isAdmin":true` e dar F5 faz a seção aparecer e o painel **abrir**, mas as telas mostram "Acesso restrito a administradores." (a mensagem da API) e a aba Network mostra **403** em todas as chamadas `/api/admin/...`; os dados não saem porque **quem protege os dados é a API**, que confere o papel no **banco**, não no que o navegador diz (confirmado nos curl: usuário comum → 403 em todas as rotas do painel). *(Complemente com o seu print `guarda-localstorage.jpg`.)*

**10. Por que as ações esperam o servidor, e o "pulo" da paginação**

Revisar, bloquear e excluir são decisões de moderação, com efeito para outras pessoas, e não "curtidas": mostrar o resultado antes de a API confirmar e desfazer se falhar seria enganoso (parecer que um usuário está bloqueado quando não está) e a tela usa o valor que a **API devolveu** (o `reviewedAt`, o `isBlocked`). Por isso há cerca por linha (`busyIds`), o botão "Salvando...", e o modal só fecha no sucesso. O **"pulo"**: a paginação por `offset` pede "pule N e traga M". Com `PAGE_SIZE = 2` e o filtro "Pendentes", se eu **revisar a primeira linha antes** de "Carregar mais", ela sai do filtro e todas descem uma posição; a página 2 (`offset 2`) começa um item **depois** do que eu esperava, e um item **nunca aparece** na lista (o servidor o tem; "Atualizar" o traz de volta). O conserto é paginação por **cursor** (Aula 18).
