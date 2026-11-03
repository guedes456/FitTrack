# Checagem de Alcançabilidade (ADR-012) — Atividade 11

| Peça | Caminho(s) de clique |
|---|---|
| Seguir / deixar de seguir | Feed → clicar no autor de um card → perfil público → botão **Seguir/Seguindo** (`FollowButton`). Visitante: perfil → botão → Login → volta ao perfil (`redirect`). |
| Listas de seguidores/seguindo | Perfil público → clicar em **N seguidores** (`/profile/:username/seguidores`) ou **N seguindo** (`/profile/:username/seguindo`); abas **Seguidores / Seguindo** trocam entre as duas listas; link "Voltar ao perfil". |
| Feed filtrado | Qualquer tela logada → item **Feed Seguindo** da Sidebar (1 clique) → `/feed/seguindo`. |

**Verificação Sidebar × router:** o `router-link` "Feed Seguindo" do `TheSidebar.vue` aponta para `/feed/seguindo`, e esse path já existe no `router/index.js` (`name: 'feed-following'`, `requiresAuth`), como placeholder "Em construção" desde a Aula 06. Não precisei ajustar nenhum dos dois: só troquei o placeholder pela tela real (`FeedFollowingView.vue`). As duas rotas de lista foram adicionadas ao router como públicas (`profile-followers` e `profile-following`), antes da rota 404.
