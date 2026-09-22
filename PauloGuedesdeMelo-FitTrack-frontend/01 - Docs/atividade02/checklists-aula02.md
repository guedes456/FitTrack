# Checklists — Atividade Aula 02 (FitTrack)

## PARTE A — Backend (módulo search)

### Etapa 1 — Criando o módulo search
- [x] Pasta modules/search/ criada
- [x] searchService.js criado, com o nome da entidade no plural (treinos)

### Etapa 2 — Criando o controller
- [x] searchController.js criado, usando exports.search = ...
- [x] O objeto retornado usa "treinos", igual ao definido no service

### Etapa 3 — Criando a rota
- [x] searchRoutes.js criado, com router.get('/search', searchController.search)

### Etapa 4 — Registrando o módulo em app.js
- [x] searchRoutes importado no topo de app.js
- [x] app.use('/api', searchRoutes) adicionado
- [x] API reiniciou sem erros

### Etapa 5 — Testando isoladamente
- [x] curl .../api/search?q=teste responde no formato esperado, com "treinos"
- [x] curl .../api/search (sem q) responde com query: ""
- [x] curl .../api continua respondendo normalmente
- [x] Print do curl (.../api/search?q=teste) — curl-search.jpg

## PARTE B — Frontend (camada de serviços)

### Etapa 1 — Instância única do Axios
- [x] src/services/api.js criado com axios.create(...) usando VITE_API_URL

### Etapa 2 — Interceptor de resposta
- [x] Interceptor de resposta adicionado a api.js
- [x] Comentário no topo do arquivo explicando os três ramos (sucesso, error.response, error.request, else)

### Etapa 3 — Criando os primeiros services
- [x] authService.js criado com register, login, logout (ainda sem uso)
- [x] searchService.js criado, usando params: { q: query }
- [x] systemService.js criado

### Etapa 4 — Refatorando a Landing Page
- [x] LandingView.vue usando getApiStatus() em vez de fetch
- [x] Confirmado visualmente que a página mostra "Status da API: online"

### Etapa 5 — Validando a camada com a busca
- [x] Console mostrou "Busca OK:" com o objeto esperado — print busca-ok.jpg
- [x] Erro de rede provocado de propósito caiu na mensagem amigável do interceptor — print erro-rede.jpg
- [x] Bloco de teste (search('a')) removido da Landing Page ao final, depois dos testes
