# Respostas — Atividade Aula 13 (Rotinas, "Salvar" e Busca com Debounce)

Na minha ficha, a "coleção" é a **Rotina** (`routines`) e a tabela de junção é
`routine_workouts` (model `RoutineWorkout`).

**1. Por que muitos-para-muitos precisa de uma tabela de junção, e por que ela tem dois índices**

Uma rotina tem vários treinos e um treino pode estar em várias rotinas. Um banco relacional não guarda uma lista dentro de uma coluna: se eu pusesse o id do treino na rotina, ela só teria um treino, e se pusesse o id da rotina no treino, ele só estaria numa rotina. A solução é uma tabela no meio, `routine_workouts`, em que cada linha diz "este treino está nesta rotina", com uma chave estrangeira para cada lado. Ela tem dois índices porque cada um acelera uma pergunta diferente. O **único composto** `(routine_id, workout_id)` impede o mesmo treino de entrar duas vezes na mesma rotina (a regra mora no banco) e também acelera "quais treinos estão nesta rotina", porque `routine_id` é a primeira coluna. O **simples em `workout_id`** acelera a pergunta inversa, "em quais rotinas este treino está" (o modal Salvar e a exclusão do treino), que o índice composto não ajuda, já que ele só serve para buscas que começam pela primeira coluna.

**2. O que é idempotente, e por que adicionar duas vezes dá 200 e remover duas vezes dá 404**

Uma ação é idempotente quando repeti-la deixa o sistema no mesmo estado que uma vez só. Adicionar é assim: depois da primeira vez o treino já está na rotina, então repetir não muda nada (o `findOrCreate` encontra a linha, `created` é `false`, o contador não sobe) e a resposta é 200 "já estava", diferente do 201 da criação. O resultado que o cliente queria ("o treino está na rotina") continua verdadeiro, então não é erro. Remover duas vezes dá 404 porque a segunda vez tenta apagar algo que não existe mais: o `destroy` devolve 0 linhas apagadas, e dizer "removido" seria mentir. O estado final também é o mesmo (o treino não está lá), mas o 404 avisa o cliente de que não havia nada para remover.

**3. Por que o ON DELETE CASCADE não corrige o contador das rotinas, e que tipo de dado é esse contador**

Quando um treino é excluído, o `ON DELETE CASCADE` apaga as linhas da junção automaticamente. Mas ele só sabe apagar linhas ligadas por chave estrangeira; não sabe que o `treinosCount` da rotina é um número guardado à parte, que precisa descer 1. O contador é um dado **derivado e guardado** (redundante: poderia ser calculado com `COUNT(*)` na junção, mas guardamos para a lista não fazer uma contagem por cartão). Todo dado derivado e guardado precisa ser atualizado pelo código junto com a fonte. No teste de controle, com o bloco da Etapa 5 comentado, excluí um treino que estava em duas rotinas: a tabela `routine_workouts` ficou com 0 linhas (o CASCADE funcionou), mas `GET /my-routines` continuou mostrando `treinosCount: 1` nas duas rotinas, contando um treino que não existe mais. Com o bloco restaurado, os dois contadores voltam a 0, na mesma transação da exclusão.

**4. A ordem 400 → 404 → 403 e as duas opções para uma coleção privada de outra pessoa**

Nas rotas de escrita, primeiro se valida o **formato** (400: o id é "abc", o corpo está sem `workoutId`, o título é curto), porque um pedido malformado nem merece uma consulta ao banco. Depois se verifica se a coisa **existe** (404). Só então se verifica a **permissão** (403): não dá para dizer que a rotina é de outra pessoa se ela nem existe. Para uma rotina **privada de outra pessoa** há duas escolhas: **403** ("existe, mas você não pode ver") ou **404** ("para você, é como se não existisse"). O 404 não revela que a rotina existe (mais privacidade); o 403 é mais honesto e ajuda a tela a explicar o motivo. Escolhi 403 com a mensagem "Esta rotina é privada.".

**5. Por que digitar %% devolvia tudo, como o escape resolve, e por que `req.query.q` precisa de `typeof`**

No `LIKE`, `%` significa "qualquer sequência de caracteres" e `_` significa "qualquer caractere". Procurar `%%` virava `LIKE '%%%%'`, que casa com qualquer título, então a busca devolvia tudo. O escape (`text.replace(/[\\%_]/g, '\\$&')`) coloca uma barra antes de `%`, `_` e da própria `\`, e o banco passa a tratá-los como texto comum: `%%` só casa com títulos que contenham literalmente `%%` (nenhum). O `typeof req.query.q === 'string'` é necessário porque a query string nem sempre é texto: `?q=ab&q=cd` vira um array e `?q[x]=1` vira um objeto, e chamar `.trim()` neles quebraria com erro 500. Se não for texto, trato como vazio.

**6. O que muda e o que não muda entre os três casos de atualização otimista, e por que `apply` devolve o undo**

Não muda o roteiro: aplicar a mudança na tela na hora, chamar a API, confirmar com a resposta do servidor se deu certo, ou desfazer se deu errado. Muda **o que** o `apply` altera (o coração e o contador de curtidas; o botão e o contador de seguidores; a caixa de uma rotina e o contador dela), **qual** chamada o `request` faz (curtir, seguir, ou adicionar/remover conforme o estado de antes) e **o que** o `confirm` acerta. O `apply` devolve o undo porque só quem aplicou a mudança sabe o estado anterior: a função de desfazer "fecha" sobre as variáveis que o `apply` guardou. Assim o `runOptimistic` não precisa conhecer nenhum dos três casos, só chama o `undo` no erro.

**7. A diferença entre as duas defesas da busca, o debounce e o lastCallId**

O **debounce** evita pedidos desnecessários: digitar "supino" sem pausa não dispara seis buscas, só uma, 400 ms depois da última tecla. Ele age **antes** da requisição. O **lastCallId** resolve outro problema: duas requisições que já saíram, em que a mais antiga responde por último (por exemplo, "sup" demora mais que "supino"). Ele descarta a resposta de qualquer chamada que não seja a mais recente, para a tela nunca mostrar resultados de um termo antigo. Age **depois** da resposta. Uma não substitui a outra: com só o debounce, uma pausa no meio da digitação ainda pode gerar duas buscas que se cruzam; com só o lastCallId, o servidor receberia uma requisição por tecla.

**8. Por que "Remover da rotina" espera a API (pessimista) e a caixa do modal não (otimista)**

A caixa do modal é um interruptor barato de desfazer: se a API falhar, a caixa volta ao estado anterior sem perda nenhuma, e o usuário vê a resposta na hora. Já "Remover da rotina" faz um **card sumir de uma lista**. Se ele sumisse antes da API responder e a remoção falhasse, o card teria que "reaparecer" em algum lugar da grade, o que é confuso e quebra a posição dos outros itens. Além disso, a ação usa o contador devolvido pelo servidor, e remover é uma ação mais "séria" do que marcar uma caixa. Por isso espera-se a resposta, e só então se tira o card e se mostra o toast de sucesso; se falhar, o card fica e o toast de erro (do interceptor) avisa.
