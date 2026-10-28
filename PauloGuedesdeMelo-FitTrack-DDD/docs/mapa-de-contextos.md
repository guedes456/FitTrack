# Mapa de contextos

- **Identity** é fornecedor (upstream) para os demais: expõe o identificador do usuário no JWT.
- **Engagement** referencia **Training** somente pelo `workoutId`; não importa o modelo de Workout.
- **Discovery** consome Training e Identity apenas para leitura.
- **Notifications** é consumidor (downstream) dos eventos de Training e Engagement, com camada anticorrupção:
  enxerga apenas o payload do evento.
- **Shared Kernel** (`src/shared`): AggregateRoot, DomainEvent, AppError, porta EventPublisher, errorHandler e configuração.
