# Checklists — Atividade Aula 07 (FitTrack)

> Upload da Entidade Principal (Workout) com Indicador de Progresso

### Parte A — Backend
- [x] Pasta de upload da entidade criada (public/uploads/workouts/)
- [x] TITLE_MAX (e DESCRIPTION_MAX) adicionados a VALIDATION
- [x] Model Workout criado (Grupo B: campo `image` único)
- [x] config/associations.js criado (User hasMany Workout / Workout belongsTo User)
- [x] Middleware de upload (workoutMulter, multer.single('image')) criado
- [x] workoutValidator, workoutService, workoutController e workoutRoutes criados
- [x] Ordem de middlewares conferida: auth -> multer -> validator -> controller
- [x] Rota POST /api/workouts montada em app.js
- [x] config/associations carregado antes do sync
- [x] Tabela `workouts` confirmada no banco, com FK

### Checklist desta etapa (Parte A)
- [x] Upload completo funciona e treinosCount sobe (curl-upload.jpg: 201)
- [x] Cada um dos quatro casos de erro é recusado com o status esperado (curl-upload.jpg e curl-formato-invalido.jpg)

### Parte B — Frontend
- [x] workoutService.js criado, recebendo onUploadProgress como parâmetro
- [x] .progress-bar e .thumbnail-preview adicionadas ao CSS (assets/main.css)
- [x] Formulário completo (título, descrição, imagem) usando BaseInput/BaseButton/FormCard
- [x] Barra de progresso implementada (onUploadProgress -> uploadPercent)
- [x] Prévia de imagem implementada (URL.createObjectURL, sem chamada de rede)
- [x] Link "Upload" na Sidebar, visível só para autenticados (já existia, agora aponta pra tela real)
- [x] Resposta ao checklist de alcançabilidade escrita (atividade07/resposta-alcancabilidade.md)

### Checklist de testes (Parte B) — testar localmente e tirar prints
- [x] Login -> link Upload -> URL muda sem recarregar (link-envio.jpg, envio-vazio-erros.jpg)
- [x] Envio vazio -> erros de campo obrigatório (envio-vazio-erros.jpg)
- [x] Arquivo selecionado -> prévia aparece sem chamada de rede (formulario-preenchido.jpg)
- [x] Envio -> barra de progresso avança -> mensagem de sucesso (progresso-upload.jpg)
- [x] DevTools Network -> Content-Type: multipart/form-data; boundary=... (upload-multipart.jpg)
- [x] Banco/Postman -> registro criado e treinosCount subiu (banco-contador.jpg)
