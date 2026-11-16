<script setup>
import { useRoute } from 'vue-router'
import { useAsyncData } from '../../composables/useAsyncData'
import { getPublicProfile } from '../../services/userService'
import { getProfilePictureUrl } from '../../utils/media'
import WorkoutCard from '../../components/workout/WorkoutCard.vue'
import FollowButton from '../../components/profile/FollowButton.vue'

const route = useRoute()

// Ao clicar no autor de um card e cair em outro perfil, a rota é a MESMA
// (/profile/:username) com outro parâmetro: o Vue Router reaproveita este
// componente. O watch faz o composable recarregar quando o parâmetro muda.
const { data: profile, isLoading, error } = useAsyncData(
  () => getPublicProfile(route.params.username).then((response) => response.data),
  { watch: () => route.params.username }
)
</script>

<template>
  <div class="p-4">
    <div v-if="isLoading" class="text-muted">Carregando perfil...</div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <p class="mb-2">{{ error }}</p>
      <router-link to="/feed" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i>Voltar ao Feed
      </router-link>
    </div>

    <template v-else-if="profile">
      <header class="profile-header mb-4">
        <img :src="getProfilePictureUrl(profile.profilePicture)" alt="" class="profile-avatar" />

        <div>
          <h1 class="h4 mb-0">{{ profile.fullName || profile.username }}</h1>
          <div class="text-muted">@{{ profile.username }}</div>
          <p v-if="profile.bio" class="mb-1 mt-1">{{ profile.bio }}</p>

          <div class="profile-counters">
            <span><strong>{{ profile.treinosCount }}</strong> treinos</span>
            <router-link :to="{ name: 'followers', params: { username: profile.username } }">
              <strong>{{ profile.followersCount }}</strong> seguidores
            </router-link>
            <router-link :to="{ name: 'following', params: { username: profile.username } }">
              <strong>{{ profile.followingCount }}</strong> seguindo
            </router-link>
          </div>

          <!-- Dono -> "Editar Perfil". Qualquer outra pessoa (inclusive o
               visitante, que é levado ao login) -> FollowButton. Os dois
               v-model ligam o botão a profile.isFollowing e a
               profile.followersCount: ao seguir, o botão e o número
               "seguidores" acima mudam JUNTOS, porque são o mesmo dado. -->
          <router-link v-if="profile.isOwner" to="/perfil" class="btn btn-sm btn-brand">
            <i class="bi bi-pencil-square me-1"></i>Editar Perfil
          </router-link>
          <FollowButton
            v-else
            :user-id="profile.id"
            v-model:following="profile.isFollowing"
            v-model:followers-count="profile.followersCount"
          />
        </div>
      </header>

      <h2 class="h5 mb-3">Treinos</h2>
      <div v-if="profile.workouts.length === 0" class="text-muted">Ainda não há treinos por aqui.</div>
      <div v-else class="workout-grid">
        <WorkoutCard v-for="workout in profile.workouts" :key="workout.id" :workout="workout" :show-author="false" />
      </div>
    </template>
  </div>
</template>
