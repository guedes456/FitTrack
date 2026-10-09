# Respostas — Atividade Aula 09

**1. 401, 403 e 404, e por que "existe?" vem antes de "é seu?"**
401 significa "não sei quem você é" (sem token ou token inválido). 403 significa "sei quem você é, mas você não pode fazer isso" (tentar editar o treino de outra pessoa). 404 significa "esse treino não existe". A checagem de existência vem primeiro porque só faz sentido falar de dono se o treino existe. Além disso, se a ordem fosse inversa, a API responderia 403 para ids que não existem e 404 só para os que existem, e qualquer pessoa conseguiria descobrir quais ids existem testando um por um.

**2. Por que o banco é atualizado antes do disco**
Se o banco é atualizado primeiro e o disco falha depois, o pior que acontece é sobrar um arquivo sem uso na pasta (um órfão), e o usuário nem percebe. Se fosse o contrário (apagar o arquivo antes e o banco falhar), o registro continuaria apontando para uma imagem que já não existe, e o usuário veria uma imagem quebrada. Sobrar lixo é um problema pequeno; apontar para um arquivo inexistente é um erro visível.

**3. O que é um arquivo órfão, exemplos e onde a limpeza acontece**
É um arquivo que está no disco mas que nenhum registro do banco usa mais. Dois exemplos do FitTrack: (a) alguém envia um treino com imagem e título vazio: o Multer já gravou a imagem antes da validação recusar a requisição com 400; (b) a pessoa B tenta editar um treino da A enviando uma imagem nova: o Multer grava o arquivo, e depois a API responde 403. Além desses, ao trocar a imagem de um treino a antiga vira órfã. A limpeza das requisições que falharam acontece no `errorHandler.js` (função `removeOrphanUploads`, que apaga `req.file`), e a da imagem antiga trocada ou excluída acontece em `workoutService.js` (`removeWorkoutFile`), depois de o banco ser atualizado.

**4. Por que o botão de excluir não fica dentro de um `<a>` e o modal não fica dentro do card**
Um botão dentro de um `<a>` é HTML inválido, e clicar nele também dispara a navegação do link, então a pessoa seria levada ao detalhe em vez de só abrir a confirmação. Por isso o card agora só tem links na imagem, no título e no autor, e os botões ficam no slot de ações, fora de qualquer link. O modal fica fora do card porque, dentro dele, ficaria preso ao tamanho e à posição do card e herdaria `overflow` e `transform` dele, em vez de ficar centralizado na tela. Ele fica em um único lugar da tela (e o `Teleport` o leva para o `body`).

**5. Por que esconder o botão "Editar" não é segurança**
Esconder o botão só muda o que aparece na tela, e qualquer pessoa pode digitar a URL de edição ou chamar a API direto, com o curl por exemplo, sem passar pelo front-end. Quem protege de verdade é o servidor: a rota de edição confere o dono e responde 403 para quem não é. O botão escondido é só conforto de interface.
