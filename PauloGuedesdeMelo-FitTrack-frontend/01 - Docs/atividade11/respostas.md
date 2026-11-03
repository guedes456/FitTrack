# Respostas — Atividade Aula 11

**1. Por que a tabela que liga a mesma tabela duas vezes precisa de apelidos (`as`), e como ler `getFollowers` e `getFollowing` sem trocá-las**

A tabela `follows` tem duas colunas (`followerId` e `followingId`) que apontam para a mesma tabela, `users`. Sem apelido, o Sequelize não tem como saber qual das duas colunas um `include` deve usar, e as duas associações `belongsTo(User)` colidiriam. Com `as: 'Follower'` (quem segue) e `as: 'Following'` (quem é seguido), cada `include` diz exatamente de que lado da relação está falando. Para não trocar as funções, eu leio em voz alta: "os **seguidores** de X são as linhas em que X é o `followingId` (o seguido), e a pessoa que eu quero é o `Follower` dessa linha". Já "quem X **segue** são as linhas em que X é o `followerId`, e a pessoa que eu quero é o `Following` da linha". O `where` usa uma coluna e o `include` usa a outra, nunca a mesma.

**2. Por que a ordem das colunas num índice composto importa, e por que a tabela tem um segundo índice**

O índice composto `(follower_id, following_id)` fica ordenado primeiro por `follower_id` e, dentro de cada valor, por `following_id`. Por isso ele ajuda em buscas por `follower_id` sozinho (quem eu sigo, o feed de quem eu sigo) e por `follower_id` + `following_id` juntos (já sigo essa pessoa? e a regra de não seguir duas vezes), mas não ajuda numa busca só por `following_id`, porque os valores de `following_id` ficam espalhados pelo índice. A lista de seguidores ("quem segue X") é justamente uma busca só por `following_id`, e para ela existe o segundo índice, simples, em `following_id`. Cada índice cobre um sentido da relação.

**3. Por que `followerId === followingId` nunca dava `true` quando o id vinha direto de `req.params`, e onde converter**

`req.params.userId` é sempre texto (`"2"`), enquanto o id que vem do token é número (`2`). O `===` não converte tipos, então `2 === "2"` é `false`, e a checagem "seguir a si mesmo" nunca disparava: a pessoa conseguia se seguir sem erro nenhum. A conversão deve acontecer na borda, no controller, com o `parseUserId` (`Number(...)` e verificação de inteiro positivo, devolvendo 400 se não for). Assim o service só recebe números e a comparação funciona.

**4. Em que situação usar `v-model` / `defineModel` em vez do padrão "valor inicial → estado próprio" da Atividade 10**

No `LikeButton` da Atividade 10, o botão recebia o valor inicial por props e guardava um estado próprio, porque mais ninguém na tela precisava enxergar aquele valor. No `FollowButton` o botão altera dados que **pertencem ao pai** e que o pai também mostra: o contador "seguidores" do cartão do perfil. Com `defineModel` (`v-model:following` e `v-model:followers-count`), o botão escreve direto no `profile.isFollowing` e no `profile.followersCount` do perfil, então o contador do cartão muda junto com o botão, sem eventos extras nem dois estados para sincronizar. A regra que uso: se o valor também é exibido ou usado fora do componente, `defineModel`; se só o componente se importa com ele, estado próprio.

**5. Por que, com `defineModel`, ler o valor logo depois de atribuí-lo devolve o antigo, e como evitar**

O valor do `defineModel` pertence ao pai: ao atribuir `following.value = ...`, o componente emite `update:following` e o valor só muda de verdade depois que o pai atualiza e a prop volta, no próximo ciclo de renderização. Ler `following.value` logo em seguida ainda devolve o valor antigo, então qualquer conta feita com ele (por exemplo, somar ou subtrair do contador) sairia pelo lado errado. Para evitar, calculo o novo estado numa variável local antes de atribuir (`const nowFollowing = !previous.following`) e uso essa variável nas duas atribuições e na conta do contador, nunca relendo `following.value`.

**6. Por que o feed filtrado devolve vazio cedo quando você não segue ninguém**

O feed filtrado primeiro busca os ids de quem o usuário segue e depois filtra os treinos com `userId IN (ids)`. Se a lista de ids estiver vazia, o `IN ()` não tem o que comparar: é inútil e, dependendo do banco, pode até ser SQL inválido. Além disso, quem não segue ninguém não pode ver treino nenhum, então a resposta já é conhecida. Por isso, com a lista vazia, o service retorna vazio logo (aqui, a mesma estrutura paginada do feed com `items: []` e `hasMore: false`), economizando a segunda consulta e evitando o erro.
