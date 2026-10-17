# Checklists — Atividade Aula 09 (FitTrack)

> CRUD do Item (Workout), Perfil Público e Limpeza de Arquivos Órfãos (Grupo B: um arquivo, `image`)

### Parte A — Backend
- [x] reload() no detalhe (feito na Aula 08, `getWorkoutDetails`)
- [x] Duas chamadas seguidas ao detalhe devolvem contagens consecutivas
- [x] Verificação 404 antes de 403 (`findOwnedWorkout`, usada em edição, atualização e exclusão)
- [x] Ordem banco -> disco respeitada (`updateWorkout` e `deleteWorkout`)
- [x] Contador do usuário (`treinosCount`) decrementado na exclusão, em transação
- [x] Quatro handlers no controller (getMyWorkouts, getWorkoutForEdit, updateWorkout, deleteWorkout)
- [x] Quatro rotas, com Multer antes do validador no PUT
- [x] include + order no nível de cima em getPublicProfile
- [x] isOwner devolvido no perfil público
- [x] /profile/:username com optionalAuth, depois de /profile/me
- [x] errorHandler.js limpando arquivos órfãos e ainda sendo o último app.use

### Checklist dos testes (Parte A) — curl, um print de cada
- [x] GET /my-workouts: sem token 401; com A lista (mais novo primeiro); com B []
- [x] GET /workouts/:id/edit: sem token 401; com B 403; inexistente 404; com A 200 (visualizações não mudam)
- [x] PUT só com texto, com A: 200, arquivo inalterado, mesma contagem de arquivos
- [x] PUT com arquivo novo, com A: 200, nome do arquivo mudou, contagem de arquivos igual
- [x] Órfãos: PUT com arquivo por B 403; PUT com arquivo e título vazio por A 400; contagem de arquivos não sobe
- [x] DELETE com B 403; com A 200; GET do item 404; arquivo sumiu; contador caiu 1; repetir DELETE 404
- [x] GET /profile/:username: anônimo (isOwner false), dono (true), B (false), inexistente 404

### Parte B — Frontend
- [x] useClickOutside.js criado (composables/)
- [x] BaseModal.vue criado (components/base/)
- [x] getMyWorkouts, getWorkoutForEdit, updateWorkout e deleteWorkout criadas no userService.js
- [x] getPublicProfile criada/atualizada
- [x] Card sem <a> gigante, com autor clicável/opcional (`showAuthor`) e slot `actions`
- [x] O Feed da Atividade 08 continua funcionando sem alteração
- [x] Menu do avatar abre pelo clique, alinha à direita, fecha ao clicar fora, em um item e com Esc
- [x] Perfil Público com os botões corretos (dono: Editar Perfil / logado: Seguir / visitante: nenhum)
- [x] Meus Itens com modal fora do card, busy e remoção local da lista
- [x] Editar Item, com e sem arquivo novo
- [x] Autor clicável e botão "Editar" condicional no Detalhe
- [x] Link para Meus Itens na mensagem de sucesso do Upload

### Checklist de testes (Parte B) — testar localmente e tirar prints
- [x] Menu do avatar: abre, fecha fora, fecha com Esc, fecha ao escolher um item (menu-avatar.jpg)
- [ ] Ver Perfil -> seu perfil, com Editar Perfil (sem Seguir) e seus itens; autor de outra conta -> perfil dela, com Seguir (perfil-publico.jpg)
- [x] Janela anônima em /profile/<username>: sem Seguir e sem Editar Perfil; username inexistente -> mensagem de erro
- [x] Meus Itens: conta sem itens -> estado vazio; com itens -> grade com Editar/Excluir; modal abre sem navegar e fecha por Cancelar/X/fora/Esc (modal-exclusao.jpg)
- [x] Confirmar exclusão: item some sem recarregar; arquivo some da pasta; contador do perfil cai
- [x] Edição: pré-preenchida; só texto mantém o arquivo; arquivo novo mostra prévia e o antigo some; título vazio -> mensagem do cliente sem requisição (editar.jpg)
- [x] DevTools -> Network: o PUT com arquivo tem Content-Type: multipart/form-data; boundary=...
- [x] Logado como B, URL de edição de um item da A -> mensagem de permissão; id inexistente -> não encontrado
- [x] Deslogado, URL de Meus Itens -> login -> volta para Meus Itens
- [x] Detalhe de um item seu -> "Editar" visível; de outra pessoa -> ausente
- [x] Regressão: Feed, Detalhe com imagem, Upload, Meu Perfil, Login/Logout
