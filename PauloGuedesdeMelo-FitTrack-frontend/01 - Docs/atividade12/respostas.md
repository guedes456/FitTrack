# Respostas — Atividade Aula 12 (Checkpoint 2)

**1. Por que `useAsyncData` recebe `() => minhaChamada()` e não `minhaChamada()`**

Se eu escrevesse `useAsyncData(minhaChamada())`, a API seria chamada na hora, uma única vez, e o composable receberia só a Promise (ou o resultado dela), não uma coisa que ele consiga executar de novo. Com `() => minhaChamada()` ele recebe uma função: ele decide quando chamar, controla o `isLoading` e o erro, e consegue repetir a chamada quando o parâmetro da rota muda ou quando eu chamo `reload`. A função "embrulha" a chamada para ela acontecer no momento certo.

**2. O que é a corrida entre respostas e como o `lastCallId` a evita**

A corrida acontece quando duas chamadas estão em andamento e a mais antiga termina por último. Exemplo: abro o treino 1, clico rápido no treino 2, e a resposta do 1 (mais lenta) chega depois da do 2. Sem proteção, ela sobrescreve a tela e eu vejo o treino 1 na URL do treino 2. O `lastCallId` é um contador: cada chamada guarda o número dela e, ao terminar, só escreve se ainda for a mais recente (`callId === lastCallId`). As respostas atrasadas de chamadas antigas são descartadas.

**3. Quem avisa o usuário quando uma ação, uma leitura e um formulário falham**

Quando uma **ação** falha (curtir, seguir, excluir), quem avisa é o interceptor do Axios, com um toast. Quando uma **leitura** falha, quem avisa é a própria tela, mostrando o erro no lugar do conteúdo. Quando um **formulário** falha, o erro aparece junto do formulário, e o service é marcado com `silent: true` para o interceptor não mostrar toast. "Toast para todo erro" seria erro de design porque o mesmo problema seria avisado duas vezes (toast e tela/formulário), e uma leitura que falha ao abrir a tela encheria o usuário de avisos sobre algo que a própria tela já explica.

**4. Por que a lista de toasts fica fora de `useToast()` (singleton) e a vantagem sobre uma store do Pinia**

Se a lista ficasse dentro da função, cada chamada de `useToast()` criaria uma lista nova, e o `ToastContainer` nunca veria os toasts criados pelo interceptor ou por outra tela. Fora da função, existe uma lista só, compartilhada por todo mundo. Em relação ao Pinia, a vantagem é que o interceptor do Axios roda fora de um componente e pode chamar `useToast()` sem depender do Pinia estar instalado e ativo naquele momento. Além disso, toast é estado passageiro de interface, não dado do app como a sessão do usuário.

**5. Por que `?limit=-3` era um problema, o que há de útil em `Number.parseInt('abc') >= 1` dar false e por que existe um teto**

Um `limit` negativo ia direto para o `LIMIT` do SQL, que não aceita valor negativo e quebrava a consulta (erro 500 em vez de uma resposta educada). `Number.parseInt('abc')` dá `NaN`, e `NaN >= 1` dá `false`: o mesmo teste `>= 1` cobre ao mesmo tempo "não é número" e "número menor que 1", e nos dois casos eu uso o valor padrão, sem precisar de um `if` separado para `NaN`. O teto (`MAX_LIMIT`, 50) existe porque sem ele `?limit=100000` faria o banco devolver a tabela inteira numa resposta só, o que pesa no servidor e na rede.

**6. Por que o miolo da atualização otimista não foi extraído e o que é a "regra dos três"**

A regra dos três diz para só extrair uma abstração quando o mesmo padrão aparece três vezes; com duas repetições ainda não dá para saber o que é igual por natureza e o que é coincidência. Hoje tenho só dois botões (curtir e seguir) e o miolo deles difere: o `LikeButton` guarda estado próprio e o `FollowButton` edita o dado do pai com `defineModel`. Por isso extraí só a parte realmente repetida (a cerca de login e o `isBusy`, no `useAuthenticatedAction`) e deixei o miolo (guardar o estado anterior, mudar a tela, confirmar ou desfazer) em cada botão.

**7. O que pode dar errado quando um Service grava o registro e o contador do autor sem transação**

São duas escritas separadas no banco. Se a primeira der certo e a segunda falhar (queda de conexão, deadlock, erro no meio), o treino fica criado, mas o `treinosCount` do autor não sobe, e a inconsistência fica para sempre, sem ninguém perceber. Com a transação, as duas escritas valem juntas ou nenhuma vale: se a segunda falha, o `ROLLBACK` desfaz a primeira.
