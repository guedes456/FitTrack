# Checkpoint 02 — Leitura guiada da API (Aula 12)

Revisão dos módulos `user`, `workout`, `like`, `comment`, `follow` e `search`
(`modules/`), dos middlewares e dos utilitários do backend do FitTrack.
Minha entidade principal é o **treino (`Workout`)**.

| Nome | Exemplo (Shortz-App) | FitTrack |
|---|---|---|
| Entidade principal | Video | Workout (treino) |
| Service que cria e mexe no contador do usuário | videoService.uploadVideo | `workoutService.createWorkout` |
| Contador do usuário afetado | videosCount | `treinosCount` |
| Controller do feed geral | userController.getFeed | `userController.getFeed` |
| Controller do feed filtrado | followController.getFollowingVideos | `followController.getFollowingWorkouts` |
| Telas que leem dados ao montar | (8 telas) | Detalhe do treino, Perfil público, Treinos curtidos, Meus treinos, Listas de seguidores/seguindo, Comentários, Feed geral, Feed seguindo |

## 2.1 Rotas

- **Alguma rota contém lógica de negócio?** Não. Os `*Routes.js` só declaram
  verbo + caminho + middlewares + controller.
- **Toda rota que chama função `async` usa `asyncHandler`?** Sim. A única rota
  sem ele é `GET /search` (`searchController.search` não é `async`).

## 2.2 Controllers

- **Algum controller consulta um Model direto?** Não. Nenhum `*Controller.js`
  importa `*Model.js`; todos passam pelo Service.
- **Algum controller devolve resposta sem `success()`?** Não. Nenhum
  `res.json` / `res.send` / `res.status` direto em `modules/`.

## 2.3 Services

- **Algum Service usa `req` / `res`?** Não.
- **Existe escrita dupla fora de transação?** Havia **uma**:
  `workoutService.createWorkout` gravava o treino e fazia
  `User.increment('treinosCount')` em dois comandos soltos. **Corrigido
  hoje** (Etapa 3): as duas escritas estão numa `sequelize.transaction` com
  `{ transaction: t }`. As demais escritas duplas (`toggleLike`, `toggleFollow`,
  `createComment`, exclusão de treino) já estavam em transação.

## 2.4 Erros

- **Os erros chegam ao `errorHandler` com `status`?** Quase: encontrei **3 erros
  sem status** em `userService.js` (e-mail já cadastrado, e-mail inexistente e
  senha errada). Sem `status`, o `errorHandler` responde **500**. **Corrigido
  hoje**: cadastro duplicado → **409**, credenciais inválidas → **401**
  (via `httpError`).

## 2.5 Ids inválidos (leitura do código)

| Rota | `abc` / `0` / `-3` | Quem valida |
|---|---|---|
| `GET /workouts/:id` e `/edit` | 404 | `parseId` (`workoutService`, ajustado hoje) |
| `POST /workouts/:workoutId/toggle-like` | 404 | `parseId` (`likeService`) |
| `GET/POST /workouts/:workoutId/comments` | 404 | `parseId` (`commentService`) |
| `POST /users/:userId/toggle-follow` | **400** | `parseUserId` (`followController`) |

**Os módulos respondem com o mesmo status?** Não: `workout`, `like` e `comment`
respondem **404** (id inválido = "não existe"); `follow` responde **400**
(decisão da Atividade 11). É uma inconsistência de política, não um bug.
*Confirmar com os três `curl` e anexar os prints.*

## 2.6 Constantes e paginação

- **O tamanho de página aparece solto em `modules/`?** Não. Só em
  `config/constants.js` (`PAGINATION`). Os dois controllers de feed usam
  `parsePagination(req.query)`.
- **`parsePagination`:** valor que não é inteiro `>= 1` (`abc`, `-3`, `0`) cai no
  padrão; `limit` tem teto `MAX_LIMIT` (50); `?limit=1` continua valendo 1
  (`>= 1`, não `> 1`).

## Perguntas extras

1. **Quantas vezes aparece o padrão `new Error(...)` / `error.status = N` /
   `throw error`?** **14** ocorrências de `new Error(` em **8 arquivos**
   (depois das correções de hoje; eram 17 em 8 arquivos):
   `modules/user/userService.js` (3), `modules/user/userValidator.js` (2),
   `modules/workout/workoutService.js` (2), `modules/workout/workoutValidator.js` (2),
   `modules/comment/commentValidator.js` (1), `middlewares/auth.js` (2),
   `middlewares/profileMulter.js` (1), `middlewares/workoutMulter.js` (1).
   Os módulos `like`, `comment` (service) e `follow` já usam `httpError`.
2. **Outro valor numérico solto em mais de um arquivo?** O **limite de tamanho do
   upload**: `8 * 1024 * 1024` em `workoutMulter.js` e `5 * 1024 * 1024` em
   `profileMulter.js`, mais o texto "8MB" fixo em `errorHandler.js` — que
   mostrava "8MB" até para foto de perfil (limite real: 5MB). **Corrigido
   hoje**: grupo `UPLOAD` em `config/constants.js`, usado pelos dois Multers e
   pelo `errorHandler` (mensagem conforme o campo).
3. **Os três `curl` de id inválido:** ver tabela da seção 2.5.

## Paginação — resultado depois da correção

Prints: `paginacao-depois.jpg` (feed geral) e `paginacao-depois-filtrado.jpg`
(feed filtrado).

| Consulta | Resultado |
|---|---|
| `?limit=-3` | `limit: 12` (valor padrão) |
| `?limit=100000` | `limit: 50` (teto `MAX_LIMIT`) |
| `?page=-2&limit=2` | `page: 1`, `limit: 2` |

O feed geral devolveu `total: 9` e o filtrado `total: 0`, porque a conta usada
no teste não seguia ninguém naquele momento.

## Paginação — reprodução ANTES da correção

Prints: `paginacao-antes.jpg` (feed geral) e `paginacao-antes-filtrado.jpg`
(feed filtrado; o print mostra `limit=100000` e `page=-2&limit=2`).

| Consulta | Resultado antes |
|---|---|
| `?limit=-3` | `limit: 1`, devolveu só 1 item (`total: 11`, `hasMore: true`) |
| `?limit=100000` | `limit: 50` |
| `?page=-2&limit=2` | `page: 1`, `limit: 2` |

No meu banco **não houve erro 500**: a versão anterior de `parsePagination` já
limitava os valores a uma faixa (mínimo 1, máximo 50). O problema que sobrava era
`?limit=-3` virar `limit: 1` em silêncio, em vez de usar o tamanho de página
padrão (12). Depois da correção, `?limit=-3` volta ao padrão (12) e qualquer valor
que não seja um inteiro `>= 1` é tratado do mesmo jeito.

## Pendências (ADR-013)

| O que é | Por que **não** foi resolvido hoje | Em qual aula será resolvido |
|---|---|---|
| `UploadView`, `EditWorkoutView` e `MyProfileView` repetem a mesma lógica de prévia de imagem (`URL.createObjectURL`, `revokeObjectURL`, limpar o `<input type="file">`) | Seria um composable novo (`useImagePreview`) mexendo em três formulários, e o checkpoint não aceita funcionalidade/refatoração fora do escopo; além disso, só agora são três usos iguais (regra dos três) | Aula 13 |
