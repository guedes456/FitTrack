# Respostas — Atividade Aula 11

**1. Por que a tabela que liga a mesma tabela duas vezes precisa de apelidos (`as`) e como ler `getFollowers` e `getFollowing`**

A tabela `follows` tem duas colunas, `followerId` e `followingId`, e as duas apontam para a mesma tabela `users`. Se eu declarasse só `Follow.belongsTo(User)`, o Sequelize não teria como saber qual das duas colunas eu quero em cada consulta. Por isso cada associação tem um apelido e a sua chave estrangeira: `Follower` (`followerId`, quem segue) e `Following` (`followingId`, quem é seguido). Para não trocar as funções, eu leio em voz alta: `getFollowers(X)` é "quem segue o X", então são as linhas em que `followingId` é o X, e o include traz o `Follower` (a pessoa do outro lado). `getFollowing(X)` é "quem o X segue", então são as linhas em que `followerId` é o X, e o include traz o `Following`.

**2. Por que a ordem das colunas num índice composto importa e por que a tabela tem um segundo índice**

Um índice composto só ajuda as consultas que usam as primeiras colunas dele, da esquerda para a direita. O meu índice único é `(follower_id, following_id)`: ele ajuda a buscar "quem eu sigo" (por `follower_id`), mas não ajuda a buscar só por `following_id`. Como a tela de seguidores precisa de "quem segue o X" (por `following_id`), eu criei um segundo índice só em `following_id`. Sem ele, essa consulta teria que olhar a tabela inteira, e a chave estrangeira de `following_id` também fica sem índice próprio.

**3. Por que `followerId === followingId` nunca dava true com o id direto de `req.params`**

O que vem de `req.params` é sempre texto: o `"2"` da URL. Já o id do usuário logado vem do token como número, `2`. Em JavaScript, `2 === "2"` é false, então a checagem de "seguir a si mesmo" nunca disparava e a pessoa conseguia seguir a si mesma sem nenhum erro. A conversão tem que acontecer na borda, que é o controller: a função `parseUserId` converte o parâmetro para número e responde 400 se não for um inteiro positivo (`abc`, `0`, `1.5`). Assim o service só recebe números e a comparação funciona.

**4. Quando usar `v-model` / `defineModel` em vez do padrão "valor inicial → estado próprio"**

O padrão da Atividade 10 (valor inicial vira um estado só do botão) serve quando o número pertence só ao botão, como o contador de curtidas dentro do `LikeButton`. No seguir, o número de seguidores aparece no cartão do perfil, que é outro pedaço da tela, e precisa mudar junto com o botão. Por isso o `FollowButton` usa `defineModel`: ele não guarda uma cópia, ele edita o dado do pai (`profile.isFollowing` e `profile.followersCount`) via `v-model`. Assim botão e contador são o mesmo dado e mudam juntos.

**5. Por que, com `defineModel`, ler o valor logo depois de atribuir devolve o antigo, e como evitar**

Atribuir `following.value = x` não muda o valor na hora: o componente só emite um evento para o pai, o pai atualiza o dado dele e a nova prop volta no próximo ciclo de renderização. Se eu lesse `following.value` logo depois de atribuir, ainda veria o valor antigo, e a conta do contador sairia errada. Para evitar, eu calculo o novo estado numa variável local antes de atribuir (`const nowFollowing = !previous.following`) e uso essa variável na conta, nunca o `following.value` recém-atribuído.

**6. Por que o feed filtrado devolve `[]` cedo quando eu não sigo ninguém**

O feed filtrado usa `userId IN (lista de quem eu sigo)`. Se a lista for vazia, o SQL fica `IN ()`, que é inválido e quebra a consulta. Por isso, no `getFollowingWorkouts`, eu busco primeiro os ids de quem sigo e, se o array vier vazio, já devolvo `items: []` e não faço a segunda consulta. Isso evita o erro e ainda economiza uma ida ao banco.
