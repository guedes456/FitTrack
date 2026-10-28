# Linguagem ubíqua

| Termo | Significado |
|---|---|
| Treino (Workout) | Publicação de um usuário com título, descrição e imagem |
| Autor | Usuário dono de um treino |
| Feed | Lista paginada de treinos, do mais novo para o mais antigo |
| Curtida (Like) | Marcação única de um usuário em um treino |
| Comentário (Comment) | Texto de até 500 caracteres em um treino |
| Notificação (Notification) | Aviso ao autor de que seu treino foi curtido ou comentado |

## Invariantes

- Um treino pertence a exatamente um usuário; só o dono edita ou exclui.
- Um usuário curte um treino no máximo uma vez.
- Título até 60 caracteres, descrição até 300, comentário até 500.
