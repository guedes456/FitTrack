# Checkpoint 01 — Consistência do Backend (Aula 06)

Revisão lado a lado dos módulos `user` (`modules/user/`) e `search`
(`modules/search/`), respondendo ao checklist da atividade.

- [x] **Alguma rota (`*Routes.js`) contém lógica de negócio, em vez de só
  declarar verbo + caminho + middlewares + controller?**
  Não. `userRoutes.js` e `searchRoutes.js` só declaram
  `método(caminho, middlewares..., controller)`. Nenhuma regra de negócio
  aparece nesses arquivos.

- [x] **Algum Controller consulta o Model diretamente, sem passar pelo
  Service?**
  Não. `userController.js` só chama funções de `userService.js`
  (`registerUser`, `loginUser`, `getUserProfile`, `getPublicProfile`,
  `updateUserProfile`). Quem importa `userModel.js` é exclusivamente o
  `userService.js`. `searchController.js` segue o mesmo padrão, chamando
  `searchService.globalSearch`.

- [x] **Algum Service faz referência a `req` / `res`?**
  Não. `userService.js` e `searchService.js` recebem só os valores já
  extraídos pelo controller (ex.: `registerUser(username, email, password,
  fullName)`), nunca o objeto de requisição/resposta inteiro.

- [x] **Todo Controller usa `success()` / `error()` de `apiResponse.js`?**
  Sim. Todas as funções de `userController.js` e `searchController.js`
  retornam `success(res, ...)`. Nenhum lugar chama `res.json(...)`
  diretamente. `error()` é usado pelo `errorHandler.js` central para os
  casos de exceção, mantendo o mesmo formato de resposta em todo lugar.

- [x] **Toda rota que chama uma função `async` está envolvida em
  `asyncHandler`?**
  Sim. `register`, `login`, `logout`, `getMyProfile`, `updateProfile` e
  `getPublicProfile` (todas `async`) estão com `asyncHandler(...)` na
  rota. O único handler sem `asyncHandler` é `searchController.search`,
  que não é `async` (não faz nenhuma chamada assíncrona ainda — o próprio
  comentário do `searchService.js` documenta que isso muda na Aula 13).

- [x] **Toda validação de entrada usa `express-validator`, sem nenhum
  `if` manual escondido?**
  Sim. `userValidator.js` concentra `registerValidator`, `loginValidator`
  e `profileUpdateValidator`, todos com `body(...)` do `express-validator`
  + a função `validate` central que lança erro a partir de
  `validationResult`. Não há `if` de validação solto dentro do
  controller ou do service.

- [x] **`config/constants.js` não tem nenhuma constante solta sem uso,
  nem nenhum valor de validação fora dela?**
  Confirmado. As quatro constantes (`USERNAME_MIN`, `USERNAME_MAX`,
  `PASSWORD_MIN`, `BIO_MAX`) são todas usadas em `userValidator.js`.
  Nenhum número mágico de validação aparece direto no validator.

- [x] **A constante de limite da bio (Aula 05) é usada exatamente uma
  vez, no lugar certo?**
  Sim. `VALIDATION.BIO_MAX` aparece uma única vez, em
  `profileUpdateValidator` (regra do campo `bio`) — não é reaproveitada
  de `USERNAME_MAX` nem duplicada em outro arquivo.

## Conclusão

O padrão de camadas (Route → Controller → Service → Model) se manteve
firme desde a Aula 01, sem nenhuma inconsistência encontrada nos módulos
revisados. Nenhuma linha de código do backend precisou ser alterada
nesta etapa.
