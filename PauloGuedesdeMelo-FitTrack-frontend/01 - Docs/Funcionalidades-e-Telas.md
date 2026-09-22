# Funcionalidades e Telas — FitTrack

| Funcionalidade típica | Tela equivalente | Vale para o FitTrack? |
|---|---|---|
| Landing / página inicial | `LandingView.vue` | Sim |
| Cadastro e autenticação | `auth/LoginView.vue`, `auth/RegisterView.vue` | Sim |
| Exploração de treinos por categoria (Feed Geral) | `FeedView.vue` | Sim |
| Feed "Seguindo" (progresso de quem você segue) | `FeedFollowingView.vue` | Sim |
| Detalhe de um treino (com avaliação, comentários, curtir) | `TreinoDetailView.vue` | Sim |
| Upload de vídeo/foto de progresso físico | `UploadView.vue` | Sim |
| Marcar treinos realizados / acompanhar progresso | `MyProgressView.vue` | Sim |
| Sugestões de treinos personalizadas | `SuggestionsView.vue` | Sim |
| Perfil próprio | `profile/MyProfileView.vue` | Sim |
| Perfil público (seguir/deixar de seguir) | `profile/PublicProfileView.vue` | Sim |
| Busca | `SearchView.vue` | Sim |
| Notificações | `NotificationsView.vue` | Sim |
| Dashboard administrativo | `admin/AdminDashboardView.vue` | Sim |
| Gerenciamento de usuários (admin) | `admin/AdminUsersView.vue` | Sim |
| Gerenciamento de treinos (admin) | `admin/AdminTreinosView.vue` | Sim |
| Gerenciamento de categorias (admin) | `admin/AdminCategoriesView.vue` | Sim |
| Rota não encontrada | `NotFoundView.vue` | Sim |

**Entidade principal:** Treino (substitui "vídeo" do exemplo genérico).

**Observações:**
- "Avaliação e comentários" e "curtir/descurtir" ficam dentro de `TreinoDetailView.vue`, não como telas separadas.
- Não há linha de "Edição de item" separada porque, no MVP desta atividade, a edição de treinos fica dentro da própria tela de gerenciamento admin (`AdminTreinosView.vue`); pode virar tela própria em aulas futuras, se necessário.
