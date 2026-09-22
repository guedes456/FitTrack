# Checklists — Atividade Aula 03 (FitTrack)

## Antes de começar
- [x] Ficha de preparação atualizada com o nome do banco (fittrack_db) e o campo de contagem (treinosCount)

## PARTE A — Backend

### Etapa 1 — Dependências
- [x] sequelize, mysql2, bcryptjs, express-validator adicionados ao package.json

### Etapa 2 — Banco de Dados MySQL
- [x] Banco fittrack_db criado no MySQL local (MariaDB, via HeidiSQL)
- [x] .env atualizado com DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- [x] DB_PASSWORD no .env trocado pela senha real do MySQL/MariaDB local
- [x] config/database.js criado

### Etapa 3 — Constantes
- [x] config/constants.js criado

### Etapa 4 — Módulo user
- [x] userModel.js criado, com o campo de contagem renomeado para treinosCount
- [x] userValidator.js criado
- [x] userService.js criado, com getPublicProfile também usando treinosCount
- [x] Nunca a senha (nem o hash) é devolvida em nenhuma resposta
- [x] middlewares/asyncHandler.js criado
- [x] middlewares/errorHandler.js criado
- [x] userController.js e userRoutes.js criados

### Etapa 5 — Registro em app.js
- [x] userRoutes e errorHandler importados e registrados em app.js, na ordem certa
- [x] Terminal exibiu "Banco de dados sincronizado!" ao subir a API
- [x] No MySQL, a tabela users existe com todas as colunas do Model (print tabelausers.jpg)

### Etapa 6 — Testes
- [x] Cadastro com sucesso responde 201 com { id, username, email } — print curl-cadastro-sucesso.jpg
- [x] Senha curta responde 400 com a mensagem correta — print curl-erro-validacao.jpg
- [x] Cadastro duplicado responde 500 — print curl-erro-duplicidade.jpg
- [x] GET /profile/:username confirma os dados persistidos — print curl-profile.jpg
- [x] Print tabelausers.jpg do MySQL (HeidiSQL)

## PARTE B — Frontend

### Etapa 2 — Navbar
- [x] Link "Criar Conta" para /register adicionado na TheNavbar.vue

### Etapa 3 — Formulário controlado
- [x] Formulário controlado com v-model amarrando cada campo a form
- [x] errors e apiErrorMessage preparados no <script setup>

### Etapa 4 — Validação client-side
- [x] validate() replica os mesmos limites do userValidator.js (username 3-20, senha mín. 6)
- [x] Mensagens de erro testadas visualmente aparecendo (print registro-erros.jpg)

### Etapa 5 — Integração com a API
- [x] handleSubmit() implementado, chamando authService.register()
- [x] Envio vazio não dispara chamada de rede — conferido na aba Network
- [x] Cadastro válido pela tela navega para /login — confirmado via login com teste@email.com
- [x] Cadastro duplicado exibe apiErrorMessage com a mensagem da API
- [x] Print registro-erros.jpg do formulário com erros client-side
- [x] Print registro-duplicidade-network.jpg da aba Network com status 500

### Etapa 6 — Teste prático
- [x] Os comportamentos do formulário de Registro testados de ponta a ponta
- [x] curl http://localhost:3000/api/profile/teste123 confirma o cadastro persistido