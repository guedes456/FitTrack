# Resposta ao Checklist de Alcançabilidade — Etapa 4 (Aula 07)

- **Login → link novo → URL muda sem recarregar:** O link "Upload" já
  existia na Sidebar desde a Aula 06 (`router-link to="/upload"`), e agora
  aponta para a tela real (`UploadView.vue`), não mais o placeholder "Em
  construção". Como é um `router-link` do Vue Router, a navegação troca só
  o componente renderizado — a página não recarrega, e a URL na barra de
  endereços muda para `/upload` normalmente.

- **Envio vazio → erros de campo obrigatório:** O formulário valida no
  cliente antes de qualquer chamada à API: título vazio bloqueia o envio
  com "O título é obrigatório.", e nenhuma imagem selecionada bloqueia com
  "A imagem do treino é obrigatória." — sem nenhuma requisição de rede
  sendo disparada nesses casos.

- **Grupo A (não se aplica):** o projeto é Grupo B (um arquivo só), então
  não existe o cenário de "escolher só um dos dois arquivos".

- **Arquivo correto → prévia sem chamada de rede:** A prévia usa
  `URL.createObjectURL(file)`, que cria uma referência local ao arquivo
  direto no navegador. Nenhum upload acontece até o formulário ser
  efetivamente enviado.

- **Envio → barra de progresso → mensagem de sucesso:** O `workoutService.
  createWorkout` recebe `onUploadProgress` do Axios e atualiza
  `uploadPercent` a cada evento, refletido na `.progress-bar`. Ao concluir,
  a mensagem "Treino enviado com sucesso!" aparece e o usuário é
  redirecionado ao feed.

- **DevTools → Network → Content-Type multipart:** Como o `FormData` é
  passado com `headers: { 'Content-Type': 'multipart/form-data' }`
  (mesmo padrão já usado no upload de foto de perfil da Aula 05), o
  Axios substitui esse header automaticamente pelo valor completo com o
  `boundary` gerado pelo navegador.

- **Banco/Postman → registro criado e contagem do usuário sobe:** O
  `workoutService.createWorkout` cria o registro em `workouts` e, na
  sequência, executa `User.increment('treinosCount', ...)` — um UPDATE
  atômico direto no banco, evitando perda de incremento em uploads
  concorrentes do mesmo usuário.
