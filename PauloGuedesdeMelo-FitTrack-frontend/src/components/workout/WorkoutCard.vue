<script setup>
import { getWorkoutImageUrl, getProfilePictureUrl } from '../../utils/media'

// Card reutilizável da grade do Feed. Recebe o treino já no formato da API
// ({ id, title, image, viewsCount, createdAt, user: { username, profilePicture } })
// e só se preocupa em exibir; quem busca os dados é a tela que usa o card.
defineProps({
  workout: { type: Object, required: true },
})

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('pt-BR')
}
</script>

<template>
  <router-link
    :to="{ name: 'treino-detail', params: { id: workout.id } }"
    class="workout-card"
  >
    <img
      :src="getWorkoutImageUrl(workout.image)"
      :alt="workout.title"
      class="workout-card-img"
      loading="lazy"
    />
    <div class="workout-card-body">
      <h2 class="workout-card-title">{{ workout.title }}</h2>
      <div class="workout-card-meta">
        <span class="d-flex align-items-center gap-1">
          <img
            :src="getProfilePictureUrl(workout.user?.profilePicture)"
            alt=""
            class="avatar-sm"
          />
          {{ workout.user?.username }}
        </span>
        <span><i class="bi bi-eye me-1"></i>{{ workout.viewsCount }}</span>
      </div>
      <div class="workout-card-meta mt-1">
        <span>{{ formatDate(workout.createdAt) }}</span>
      </div>
    </div>
  </router-link>
</template>
