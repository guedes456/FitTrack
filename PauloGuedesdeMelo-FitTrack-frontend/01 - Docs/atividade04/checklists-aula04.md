# Checklists — Atividade Aula 04 (FitTrack)

## Antes de começar
- [x] Ficha de preparação atualizada com a cor de marca (#FF6B35)

## PARTE A — Backend: Login, JWT e Middleware de Autenticação

### Checklist das tarefas
- [x] jsonwebtoken instalado
- [x] .env atualizado com JWT_SECRET e JWT_EXPIRES_IN
- [x] config/jwt.js criado e programado com as funções de carregamento e segurança do .env, geração e verificação de tokens
- [x] middlewares/auth.js criado e programado
- [x] userService.js atualizado com loginUser e getUserProfile
- [x] userValidator.js atualizado com loginValidator
- [x] userController.js atualizado com login, logout, getMyProfile
- [x] userRoutes.js atualizado, com /profile/me antes de /profile/:username

### Checklist dos testes
- [x] Login com sucesso devolve token e user (incluindo isAdmin) — print curl-login-sucesso.jpg
- [x] Senha errada devolve 500 com mensagem genérica — print curl-login-senha-errada.jpg
- [x] GET /profile/me sem token devolve 401 — print curl-profile-me-sem-token.jpg
- [x] GET /profile/me com token válido devolve os dados do usuário — print curl-profile-me-token-valido.jpg
- [x] GET /profile/me com token inválido devolve 401 — print curl-profile-me-token-invalido.jpg

## PARTE B — Frontend: Login, Pinia e Proteção de Rotas

### Checklist das tarefas
- [x] createPinia() registrado em main.js, antes de .use(router)
- [x] stores/auth.js criado, com persistência via localStorage
- [x] Interceptor de requisição anexando Authorization quando existe token
- [x] Interceptor de resposta limpando a sessão e redirecionando em qualquer 401
- [x] Os nomes de chave usados aqui batem exatamente com os usados na store (fittrack_token / fittrack_user)
- [x] Bootstrap 5 (CSS) incluído via CDN
- [x] assets/main.css criado, com a cor de marca do seu projeto (#FF6B35)
- [x] Telas construídas de hoje em diante usam classes Bootstrap; as telas das Aulas 01–03 permanecem como estão, por ora
- [x] Tela de Login funcional, chamando authStore.login(...)
- [x] Destino padrão pós-login ajustado à rota "feed" (rota principal do FitTrack)
- [x] Guarda de rota bloqueando acesso direto a rotas com requiresAuth: true
- [x] useAuthStore() chamado dentro do callback, não no topo do arquivo
- [x] Navbar mostra links diferentes conforme o estado de login
- [x] Logout limpa a sessão e redireciona ao Login
- [x] MyProfileView.vue chama GET /profile/me e loga "Perfil autenticado OK:" no Console

### Checklist de testes
- [x] Login funcional → redireciona à tela principal do seu projeto — print login-feed-redirect.jpg
- [x] F5 na página logado → sessão persiste (confirmado no fluxo de teste)
- [x] Logout → digitar a URL de uma rota protegida na barra de endereço redireciona ao Login, com ?redirect=... na URL — print redirect-rota-protegida.jpg
- [x] Login a partir dessa tela redirecionada → volta exatamente para a rota original (/perfil) — confirmado
- [x] Editar manualmente o token no localStorage (DevTools) para um valor qualquer, recarregar numa rota protegida → redireciona automaticamente ao Login — print token-adulterado-logout-automatico.jpg

## Entrega
- [x] Prints da Parte A (um por curl) em .jpg
- [x] Print login-estilizado.jpg (tela de Login com Bootstrap/cor de marca)
- [x] Print do redirecionamento ?redirect=... ao acessar rota protegida deslogado
- [x] Print do Console mostrando "Perfil autenticado OK:"
- [x] Print do logout automático após editar o token manualmente
