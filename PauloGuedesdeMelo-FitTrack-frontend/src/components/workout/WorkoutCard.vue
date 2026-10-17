<script setup>
import { getWorkoutImageUrl, getProfilePictureUrl } from '../../utils/media'
import { formatDate, formatCount } from '../../utils/format'

// Card reutilizável. Recebe o treino no formato da API
// ({ id, title, image, viewsCount, createdAt, user: { username, profilePicture } }).
//
// Por que o card NÃO é mais um <a> gigante: link dentro de link é HTML
// inválido, e botão dentro de <a> dispara a navegação junto com o clique.
// Agora o card é um <article> e só a imagem e o título são links; o autor é
// outro link independente, e as ações (Editar/Excluir) ficam num slot, fora
// de qualquer <a>.
defineProps({
  workout: { type: Object, required: true },
  // false em telas onde todos os cards são do mesmo autor (perfil, Meus Itens).
  showAuthor: { type: Boolean, default: true },
})
</script>

<template>
  <article class="workout-card">
    <router-link
      :to="{ name: 'treino-detail', params: { id: workout.id } }"
      class="workout-card-media"
      :aria-label="workout.title"
    >
      <img
        :src="getWorkoutImageUrl(workout.image)"
        :alt="workout.title"
        class="workout-card-img"
        loading="lazy"
      />
    </router-link>

    <div class="workout-card-body">
      <h2 class="workout-card-title">
        <router-link :to="{ name: 'treino-detail', params: { id: workout.id } }">
          {{ workout.title }}
        </router-link>
      </h2>

      <div class="workout-card-meta">
        <router-link
          v-if="showAuthor && workout.user"
          :to="{ name: 'public-profile', params: { username: workout.user.username } }"
          class="workout-card-author"
        >
          <img
            :src="getProfilePictureUrl(workout.user.profilePicture)"
            alt=""
            class="avatar-sm"
          />
          {{ workout.user.username }}
        </router-link>
        <span v-else></span>
        <span class="workout-card-stats">
          <span title="Visualizações"><i class="bi bi-eye me-1"></i>{{ formatCount(workout.viewsCount) }}</span>
          <span title="Curtidas"><i class="bi bi-heart me-1"></i>{{ formatCount(workout.likesCount) }}</span>
          <span title="Comentários"><i class="bi bi-chat me-1"></i>{{ formatCount(workout.commentsCount) }}</span>
        </span>
      </div>

      <div class="workout-card-meta mt-1">
        <span>{{ formatDate(workout.createdAt) }}</span>
      </div>

      <div v-if="$slots.actions" class="workout-card-actions">
        <slot name="actions" />
      </div>
    </div>
  </article>
</template>
