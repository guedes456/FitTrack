<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '../composables/useAsyncData'
import { getWorkoutById } from '../services/userService'
import { getWorkoutImageUrl, getProfilePictureUrl } from '../utils/media'
import { formatDate } from '../utils/format'
import LikeButton from '../components/workout/LikeButton.vue'
import CommentSection from '../components/workout/CommentSection.vue'

const route = useRoute()

// watch: se o :id da URL mudar sem a tela ser recriada, recarrega (e a
// resposta mais antiga, se chegar atrasada, é descartada pelo composable).
const { data: workout, isLoading, error } = useAsyncData(
  () => getWorkoutById(route.params.id).then((response) => response.data),
  { watch: () => route.params.id }
)

// Vem da API (true só quando o token enviado é do dono do treino): decide se
// o botão de editar aparece.
const isOwner = computed(() => workout.value?.isOwner ?? false)

// A seção de comentários avisa quando um comentário novo foi publicado, para
// o contador do treino subir sem recarregar a tela.
function handleCommentAdded() {
  workout.value.commentsCount += 1
}
</script>

<template>
  <div class="p-4">
    <div v-if="isLoading" class="text-muted">Carregando treino...</div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <p class="mb-2">{{ error }}</p>
      <router-link to="/feed" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i>Voltar ao Feed
      </router-link>
    </div>

    <article v-else-if="workout" class="mx-auto" style="max-width: 760px;">
      <router-link to="/feed" class="small text-muted">
        <i class="bi bi-arrow-left me-1"></i>Voltar ao Feed
      </router-link>

      <h1 class="h3 mt-2 brand-title">{{ workout.title }}</h1>

      <div class="d-flex align-items-center gap-2 text-muted small mb-3">
        <router-link
          v-if="workout.user"
          :to="{ name: 'public-profile', params: { username: workout.user.username } }"
          class="d-flex align-items-center gap-2 text-muted text-decoration-none"
        >
          <img
            :src="getProfilePictureUrl(workout.user.profilePicture)"
            alt=""
            class="avatar-sm"
          />
          <span>{{ workout.user.fullName || workout.user.username }}</span>
        </router-link>
        <span>·</span>
        <span>{{ formatDate(workout.createdAt) }}</span>
        <span>·</span>
        <span><i class="bi bi-eye me-1"></i>{{ workout.viewsCount }}</span>

        <!-- Esconder o botão é só conforto de interface, NÃO segurança: quem
             digita a URL de edição à mão ainda chega à tela. Quem de fato
             bloqueia é a API, que responde 403 para quem não é o dono. -->
        <router-link
          v-if="isOwner"
          :to="{ name: 'workout-edit', params: { id: workout.id } }"
          class="btn btn-sm btn-outline-secondary ms-auto"
        >
          <i class="bi bi-pencil me-1"></i>Editar
        </router-link>
      </div>

      <!-- Grupo B: a imagem É o conteúdo, então é só uma <img> em resolução
           real apontando para o arquivo estático (sem player e sem header
           Authorization, que uma tag <img> não consegue enviar). -->
      <img
        :src="getWorkoutImageUrl(workout.image)"
        :alt="workout.title"
        class="workout-detail-img"
      />

      <div class="d-flex align-items-start gap-3 mt-3">
        <!-- :key força um LikeButton novo ao trocar de treino. -->
        <LikeButton
          :key="workout.id"
          :workout-id="workout.id"
          :initial-liked="workout.isLiked"
          :initial-count="workout.likesCount"
        />
        <span class="text-muted pt-1"><i class="bi bi-chat me-1"></i>{{ workout.commentsCount }}</span>
      </div>

      <p v-if="workout.description" class="mt-3" style="white-space: pre-line;">
        {{ workout.description }}
      </p>

      <CommentSection :key="`comments-${workout.id}`" :workout-id="workout.id" @added="handleCommentAdded" />
    </article>
  </div>
</template>
