# Checklists — Atividade Aula 05 (FitTrack)

## PARTE A — Backend: Upload de Arquivos com Multer

### Checklist das tarefas
- [x] Pasta public/uploads/profiles/ criada, com um default-profile.png dentro
- [x] multer instalado (adicionado ao package.json)
- [x] BIO_MAX: 160 adicionado a config/constants.js (constante dedicada, não reaproveitada)
- [x] middlewares/profileMulter.js criado
- [x] require('path') e a linha de express.static adicionados, antes das rotas da API
- [x] profileUpdateValidator, updateUserProfile, updateProfile e a rota PUT /profile/me criados, na ordem correta (isAuthenticated → profileMulter → profileUpdateValidator → controller)

### Checklist dos testes
- [x] Atualização sem foto funciona, mantendo a foto atual
- [x] Atualização com foto nova funciona, e a foto antiga (se não era a padrão) é removida do disco
- [x] GET /uploads/profiles/<qualquer-arquivo> responde 200
- [x] Bio acima de 160 caracteres é recusada com 400

## PARTE B — Frontend: Formulário Multipart e a Tela de Meu Perfil

### Checklist desta etapa
- [x] Link para a tela de perfil visível na Navbar, só quando logado (renomeado para "Meu Perfil")
- [x] .env atualizado com VITE_API_BASE_URL, utils/media.js criado
- [x] updateProfile(formData) adicionada em userService.js — a única chamada da aplicação a sobrescrever o Content-Type padrão

### Checklist dos testes
- [x] Tela carrega os dados reais do usuário ao montar, navegando a partir da Landing Page
- [x] Selecionar uma foto atualiza a prévia instantaneamente, sem chamada de rede
- [x] Salvar funciona, com e sem trocar de foto

## Entrega
- [x] Print perfil-carregado.jpg (tela de Meu Perfil com dados reais)
- [x] Print preview-local.jpg (prévia local + Network sem chamada nova)
- [x] Print uploadmultipart.jpg (Network mostrando Content-Type: multipart/form-data; boundary=...)
- [x] Print navbar-link-perfil.jpg (link "Meu Perfil" visível quando logado)
- [x] Prints dos curls de teste da Parte A (atualização sem foto, atualização com foto, GET /uploads/profiles/..., bio longa recusada)
