# Catálogo de eventos

Envelope: `{ eventId, type, version, occurredAt, payload }`. Exchange topic `fittrack.events`.

| Evento | Produtor | Consumidores | Routing key | Payload mínimo |
|---|---|---|---|---|
| WorkoutLiked | engagement | notifications | engagement.workout.liked | workoutId, ownerId, likerId |
| CommentCreated | engagement | notifications | engagement.comment.created | commentId, workoutId, ownerId, authorId |
| WorkoutCreated | training | (futuro) discovery | training.workout.created | workoutId, ownerId |
| WorkoutDeleted | training | engagement, identity | training.workout.deleted | workoutId, ownerId |
