# Respostas — Atividade Aula 10

**1. Por que "uma pessoa só curte uma vez" tem que estar no banco**

Se a regra existisse só no código (primeiro procuro se já curtiu e, se não, crio), duas requisições quase ao mesmo tempo, por exemplo dois cliques seguidos, poderiam passar pela checagem juntas, achar que ainda não curtiu e as duas inserirem. Aí o mesmo usuário teria duas curtidas no mesmo treino. No meu projeto a tabela `likes` tem um índice único composto em `(user_id, workout_id)`, então o próprio banco recusa a segunda linha, aconteça o que acontecer no código. Eu testei inserindo uma curtida repetida à mão, e o banco deu erro de chave duplicada.

**2. Contador guardado x contador calculado, e o risco**

Contador calculado é fazer um `COUNT(*)` na tabela `likes` toda vez que preciso do número: ele sempre bate com a realidade, mas fica mais pesado numa lista com muitos cards. Contador guardado é a coluna `likesCount` no treino, que eu aumento ou diminuo a cada curtida: é rápido de ler, mas o risco é ele ficar diferente do número real de linhas, por exemplo se a linha da curtida for criada e o contador não for atualizado por causa de um erro no meio. A transação resolve isso, porque a linha e o contador são alterados juntos: ou os dois mudam, ou nenhum. No toggle de curtida eu também travo a linha do treino (`lock: t.LOCK.UPDATE`), porque no meu teste com 12 cliques simultâneos do mesmo usuário, sem a trava, o contador chegou a ficar negativo.

**3. O que acontece se um comando dentro do `sequelize.transaction` esquecer o `{ transaction: t }`**

Esse comando roda numa outra conexão, fora da transação. Por isso ele não enxerga o que a transação ainda não confirmou e, pior, não é desfeito se a transação der rollback. Na prática a transação deixa de proteger aquela escrita: por exemplo, a curtida poderia ser criada de verdade e o contador voltar atrás (ou o contrário). Também pode travar, porque a conexão de fora fica esperando uma linha que a transação ainda segura. Por isso conferi que todos os comandos do `toggleLike`, do `createComment` e do `deleteWorkout` recebem `{ transaction }`.

**4. O que é atualização otimista, os três passos e quando não usar**

Atualização otimista é mudar a tela na hora, sem esperar a resposta da API, apostando que ela vai dar certo. No `LikeButton.vue` eu faço assim: (1) guardo o estado anterior (se estava curtido e quantas curtidas tinha); (2) mudo o coração e o contador imediatamente; (3) chamo a API e, se der certo, adoto os valores que ela devolveu, e se der erro desfaço tudo (rollback) e mostro a mensagem. Testei com a internet lenta, em que o coração mudou na hora, e com o modo offline, em que ele mudou, voltou atrás e apareceu o erro. Não vale usar em ações que o usuário precisa ver confirmadas ou que têm consequências difíceis de desfazer, como excluir algo, pagar ou enviar um formulário importante. Nesses casos é melhor esperar a resposta (e é por isso que a exclusão usa o botão com "Excluindo...").

**5. Por que o comentário sai com `{{ }}` e nunca com `v-html`**

O `{{ }}` escapa o texto: o que a pessoa digitou aparece como texto puro, mesmo que tenha tags. O `v-html` interpreta o conteúdo como HTML de verdade, então alguém poderia comentar algo como `<img src=x onerror="alert(1)">` e esse código rodaria no navegador de todo mundo que abrisse o treino (um ataque XSS). Testei exatamente esse comentário e ele aparece escrito na tela, sem negrito e sem alerta. Para as quebras de linha eu não preciso de HTML: uso `white-space: pre-line` no CSS.

**6. Por que o `.trim()` vem antes do `.notEmpty()`**

Os validadores rodam na ordem em que foram escritos. Se o `notEmpty()` vem primeiro, um texto só com espaços (`"     "`) passa, porque tecnicamente não está vazio, e só depois o `trim()` transforma em `""`, o que deixa um dado vazio chegar ao banco. Com o `trim()` primeiro, os espaços somem antes da checagem e o `notEmpty()` recusa. Corrigi essa ordem no comentário e também nos validadores antigos (usuário, nome completo, bio, título e descrição do treino), e confirmei que um título só com espaços agora retorna 400.
