# Respostas — Atividade Aula 14 (Notificações e Denúncias)

Na minha ficha: entidade = **treino** (`Workout`, `workoutId`); notificação = `Notification` (tabela `notifications`, módulo `notification`); denúncia = `Report` (tabela `reports`, módulo `report`); gatilhos = `toggleLike`, `createComment` e `toggleFollow`; tela = `NotificationsView`; modal = `ReportWorkoutModal`.

**1. Por que a notificação é criada dentro da mesma transação, e o que acontece se esquecer o `t`**

Curtir, comentar e seguir já são transações (a linha, o contador e agora o aviso). Se o aviso fosse criado fora dela, poderíamos ter uma curtida desfeita por erro com o aviso já gravado (o dono receberia um "curtiu" que não existe) ou o contrário. Dentro da transação, ou tudo vale ou nada vale. Se eu esquecer de repassar o `t` ao `createNotification`, o `INSERT` roda em **outra conexão** do pool. Como `notifications` tem chave estrangeira para `workouts` e a transação da curtida segura essa linha do treino travada (`FOR UPDATE`), o `INSERT` fica esperando um lock que só seria liberado quando a transação terminar, e a transação está esperando o `INSERT` (que está na função que ela chamou). O sintoma é a requisição travar e, uns 50 segundos depois, responder 500 `Lock wait timeout exceeded`. A causa é o `INSERT` fora da transação.

**2. As regras de uma notificação verdadeira**

Ninguém é avisado das próprias ações (`userId === actorId` não cria nada): curtir ou comentar no meu próprio treino seria ruído, e eu veria avisos sobre o que acabei de fazer. Descurtir apaga o aviso porque o fato que ele anunciava deixou de ser verdade (a curtida não existe mais), e se a pessoa curtir de novo nasce um aviso novo, então nunca ficam dois do mesmo gesto. O mesmo vale para deixar de seguir. Comentar não tem "desfazer" porque a API não exclui comentários, e um comentário é uma mensagem que já foi dita: mesmo que um dia exista exclusão, o aviso é de algo que aconteceu.

**3. Por que `unread-count` é uma rota separada e o que cada índice acelera**

O sino pergunta o número a cada 30 segundos, para cada usuário logado. Uma rota própria faz só um `COUNT` e devolve `{ unreadCount }`, sem `include` de quem agiu e do treino, sem paginação e sem trazer linhas; buscar a lista inteira só para contar seria muito mais caro e repetido o tempo todo. O índice `(user_id, is_read)` acelera "as notificações deste usuário" (a primeira coluna) e "as não lidas deste usuário" (as duas colunas: o `COUNT` do sino). O índice em `workout_id` acelera a pergunta "quais avisos são deste treino?", usada ao excluir o treino (e no `SET NULL` do banco), que o primeiro índice não ajuda porque ele só serve quando a busca começa por `user_id`.

**4. Por que denunciar de novo responde 409 e não 200, e o que garante isso com dois cliques**

Adicionar à rotina é idempotente: repetir não muda nada e o resultado que o usuário queria ("o treino está na rotina") continua verdadeiro, então 200 "já estava". Denunciar de novo é diferente: o usuário já fez aquilo, e a tela precisa dizer "Você já denunciou este treino" (409, conflito). Com dois cliques simultâneos, quem garante é o **índice único** `(user_id, workout_id)` do banco: os dois passam pela checagem ao mesmo tempo, mas o segundo `INSERT` é recusado, o `findOrCreate` devolve `created: false` (e o service também trata o `SequelizeUniqueConstraintError`), e o segundo clique recebe 409. A regra mora no banco, não só no código.

**5. As duas defesas do motivo e por que o banco guarda chaves**

O **validator** (`body('reason').isIn(REPORT.REASONS)`) barra na API, com uma mensagem clara (400). O **ENUM** do banco barra se alguém contornar a API ou se um bug deixar passar (o teste mostrou `Data truncated for column 'reason'`). O banco guarda **chaves** (`spam`, `harassment`...) porque elas são estáveis e independentes de idioma: o rótulo "Spam ou golpes" pode mudar de texto ou de língua sem migrar dados, e a Aula 15 lê as denúncias com a mesma lista. A tela mostra **rótulos** porque é para a pessoa ler; por isso o rótulo em vez da chave também responde 400.

**6. Os três comportamentos de chave estrangeira e o que vi no teste de controle**

`CASCADE` apaga as linhas filhas junto (foi o caso da junção de rotinas). `NO ACTION` **recusa** excluir o pai enquanto houver filhas. `SET NULL` aceita excluir o pai e coloca NULL na coluna das filhas. Quem escolhe é a associação `belongsTo`: `reports.workout_id` é `NOT NULL`, então ficou `NO ACTION`; `notifications.workout_id` aceita NULL, então ficou `SET NULL`. No teste de controle (a), com o `destroy` das denúncias comentado, excluir um treino curtido e denunciado respondeu **500** com a mensagem *"Cannot delete or update a parent row: a foreign key constraint fails (`fittrack`.`reports`, CONSTRAINT ... ON DELETE NO ACTION ...)"*: o banco protegeu a integridade e recusou. No teste (b), com o `destroy` das notificações comentado, a exclusão respondeu **200**, mas sobrou **uma notificação órfã** (`type like`, `workout_id NULL`), apontando para um treino que não existe mais. Nos dois casos a API precisa apagar as filhas **antes** do pai, na mesma transação.

**7. Como o polling se mantém correto**

30 segundos é um equilíbrio: o aviso chega "quase na hora" sem martelar a API (com 5 s, cada usuário logado geraria seis vezes mais requisições). Quem **liga** é a Navbar: o `watch(isAuthenticated, ..., { immediate: true })` chama `startPolling` ao entrar na conta (e ao abrir o site já logado); quem **desliga** é o mesmo `watch` ao sair (`stopPolling`), mais o `onUnmounted`. O `if (timerId !== null) return` impede um segundo temporizador se o `startPolling` for chamado duas vezes (logins repetidos, o `watch` disparando de novo): sem ele, os intervalos se empilhariam e multiplicariam as requisições. A aba escondida não pergunta (`document.visibilityState`) porque ninguém está olhando o sino, e perguntar a cada 30 s em segundo plano só gasta bateria e rede; o evento `visibilitychange` faz uma pergunta imediata quando a pessoa volta.

**8. A corrida do contador**

O polling pergunta e a resposta demora ("5"). Nesse meio-tempo a pessoa marca uma notificação como lida e o sino vai para "4". Aí a resposta velha chega e sobrescreve o "4" com o "5": o sino "volta" sozinho, mostrando um número que já não é verdadeiro. O `lastRefreshId` resolve: cada `refresh` leva um número e só o mais recente escreve. Mas a mudança manual do número (marcar como lida, o undo) **não passa pelo refresh**; por isso o `setUnreadCount` também sobe o `lastRefreshId`: com isso, qualquer refresh que já tinha saído antes da mudança é invalidado e a resposta velha é descartada.

**9. O que muda e o que não muda no quarto caso do `runOptimistic`, e por que o undo é relativo**

Não muda o roteiro (aplicar, pedir, confirmar ou desfazer) nem o arquivo `utils/optimistic.js`. Muda o que o `apply` mexe (marca a linha **e** o sino), o `request` (o `PATCH` de marcar como lida) e o `confirm` (acerta a linha e entrega à store o `unreadCount` que a API calculou depois da escrita). O desfazer do sino é **relativo** (`+ 1`) e não "volte ao número que eu vi" porque o número do sino pode ter mudado no meio da história (outra marcação, um refresh): se o undo gravasse o valor antigo, sobrescreveria essas mudanças. Com duas linhas falhando juntas, cada undo soma 1 e o sino volta exatamente ao número do começo; se cada undo gravasse "o que eu vi", o segundo apagaria o efeito do primeiro.

**10. Por que um 400 do logout aparecia como erro de CORS**

O `authService` mandava `api.post('/logout', null, ...)`: o Axios enviava o corpo `"null"` com `Content-Type: application/json`. O `express.json()` aceita só objetos e arrays, então recusava esse corpo com 400 (erro de parse). Como o `app.use(cors(...))` estava **depois** do `express.json()`, o 400 saía antes de o `cors` rodar e, portanto, **sem o cabeçalho `Access-Control-Allow-Origin`**. O navegador, sem esse cabeçalho, escondia a resposta e mostrava no Console "bloqueado pelo CORS" em vez do 400 verdadeiro. A ordem dos middlewares importa: o `cors` precisa vir primeiro, para toda resposta (inclusive as de erro dos parsers) carregar o cabeçalho. Além disso, corrigi a causa no front: o segundo argumento do `post` agora é `undefined` (sem corpo).
