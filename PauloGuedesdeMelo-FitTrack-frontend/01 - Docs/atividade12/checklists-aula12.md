## Atividade 12 — Checkpoint 2 (Leitura crítica, constantes, useAsyncData, toasts e regressão)

### Parte A — Backend
- [x] checkpoint-02.md criado, com as respostas dos Blocos 2.1 a 2.6 e as três perguntas extras
- [ ] Problema de paginação reproduzido e anotado antes da correção (print paginacao-antes.jpg)
- [x] PAGINATION e utils/pagination.js criados e usados nos dois controllers e nos dois services
- [ ] Testes do Bloco 3.4 com o resultado esperado (print paginacao-depois.jpg)
- [x] workoutService.createWorkout dentro de uma transação, com { transaction: t } nas duas escritas
- [ ] Criação testada: 201 e treinosCount incrementado
- [ ] Bateria de regressão da API (Bloco 4) sem regressão, com print de cada curl

### Parte B — Frontend
- [x] constants.js criado, com limites iguais aos da API
- [x] api.js, stores/auth.js e os services de feed usam as constantes
- [x] useToast e ToastContainer criados; container montado uma vez em App.vue
- [x] Interceptor com notifyIfNeeded; silent apenas nos formulários (login, cadastro, logout, perfil, upload, edição e comentário)
- [ ] Toasts testados: login com senha errada sem toast; curtir Offline com toast e botão revertido; toast na frente do modal
- [x] useAsyncData e usePaginatedList criados e usados nas oito telas de leitura, sem apiErrorMessage sobrando
- [ ] Cada tela testada individualmente no navegador
- [x] Decisão registrada: MyProfileView, UploadView, EditWorkoutView, LoginView e RegisterView ficam fora dos composables de leitura (a tela existe para preencher um formulário; o carregamento inicial é só para preencher os campos e a falha é da tela de edição)
- [x] useAuthenticatedAction criado e usado em LikeButton e FollowButton, sem errorMessage local
- [ ] Três cliques rápidos com Slow 4G geram uma requisição (print uma-requisicao.jpg)
- [x] Nenhum limite solto nos formulários (LIMITS.*)
- [ ] Teste de regressão completo (Bloco 11) com conta nova, sem erros vermelhos no Console
