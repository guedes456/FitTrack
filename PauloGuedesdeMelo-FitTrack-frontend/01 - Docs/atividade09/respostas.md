# Respostas — Atividade Aula 09

**1. Diferença entre 401, 403 e 404 e por que "existe?" vem antes de "é seu?"**

Eu entendo o 401 como "a API não sabe quem você é", porque não veio token ou ele é inválido. O 403 é "a API sabe quem você é, mas você não tem permissão", como quando a conta B tenta editar o treino da conta A. O 404 é "esse treino não existe". No meu código, a função `findOwnedWorkout` do `workoutService.js` primeiro procura o treino (404 se não achar) e só depois compara o dono (403). Se fosse ao contrário, um id que não existe daria 403 e um id que existe daria 404 para outras pessoas, e dava para descobrir quais ids existem só testando um por um.

**2. Por que o banco é atualizado antes do disco**

Quando eu troco a imagem ou excluo um treino, primeiro atualizo o banco e só depois apago o arquivo antigo do disco. Se o banco falhar, eu nem chego a apagar o arquivo e continua tudo como estava. Se o arquivo não for apagado depois do banco, só sobra um arquivo sem uso na pasta, e o usuário não percebe nada. Na ordem inversa, se eu apagasse o arquivo primeiro e o banco desse erro, o treino continuaria no banco apontando para uma imagem que não existe mais, e a imagem apareceria quebrada.

**3. O que é arquivo órfão, dois exemplos e onde a limpeza acontece**

Arquivo órfão é um arquivo que está na pasta de uploads, mas que nenhum registro do banco usa. Dois exemplos do meu projeto: (1) eu envio um treino com imagem, mas deixo o título vazio. O Multer salva a imagem antes da validação, e a validação depois recusa com 400, então a imagem fica na pasta sem treino; (2) a conta B tenta editar o treino da A mandando uma imagem nova. O Multer salva o arquivo e só depois a API responde 403. Quando a requisição dá erro, a limpeza acontece no `errorHandler.js`, na função `removeOrphanUploads`, que apaga o `req.file`. Já a imagem antiga, quando eu troco a imagem ou excluo o treino, é apagada no `workoutService.js` (função `removeWorkoutFile`), depois de atualizar o banco.

**4. Por que o botão de excluir não fica dentro de um `<a>` e o modal fora do card**

Se o botão ficasse dentro de um `<a>`, ao clicar nele o navegador também seguiria o link e me levaria para o detalhe do treino em vez de só abrir a confirmação. E botão dentro de link também não é HTML válido. Por isso o card ficou só com links na imagem, no título e no autor, e os botões Editar e Excluir ficam no slot `actions`, fora de qualquer link. O modal fica fora do card porque, se estivesse dentro, ele ficaria preso ao tamanho e à posição do card e herdaria coisas como `overflow` e `transform`, em vez de aparecer centralizado na tela. Por isso existe um único modal na tela de Meus Itens (e o `BaseModal` usa `Teleport` para ir ao `body`), e o card só avisa qual treino foi escolhido.

**5. Por que esconder o botão "Editar" não é segurança**

Esconder o botão só muda o que a pessoa vê na tela. Qualquer um pode digitar a URL de edição direto no navegador, ou chamar a API com o curl ou o Postman sem passar pelo front-end. A segurança de verdade está na API: a rota de edição confere se o treino é do usuário do token e responde 403 se não for. No meu teste, a conta B digitou a URL de edição de um treino da A e recebeu a mensagem de permissão, mesmo sem ver o botão.
