<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicProfile } from '../../services/userService'
import { getProfilePictureUrl } from '../../utils/media'
import { useAuth } from '../../composables/useAuth'
import WorkoutCard from '../../components/workout/WorkoutCard.vue'

const route = useRoute()
const { isAuthenticated } = useAuth()

const profile = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

async function loadProfile(username) {
  isLoading.value = true
  errorMessage.value = ''
  profile.value = null

  try {
    const response = await getPublicProfile(username)
    profile.value = response.data
  } catch (error) {
    // 404 (usuário inexistente) ou falha de rede: mensagem na tela, sem quebrar.
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

// Ao clicar no autor de um card e cair em outro perfil, a rota é a MESMA
// (/profile/:username) com outro parâmetro: o Vue Router reaproveita este
// componente em vez de recriá-lo. Por isso observamos o parâmetro — sem o
// watch, a tela continuaria mostrando o perfil anterior.
watch(() => route.params.username, (username) => loadProfile(username), { immediate: true })
</script>

<template>
  <div class="p-4">
    <div v-if="isLoading" class="text-muted">Carregando perfil...</div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      <p class="mb-2">{{ errorMessage }}</p>
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
            <span><strong>{{ profile.followersCount }}</strong> seguidores</span>
            <span><strong>{{ profile.followingCount }}</strong> seguindo</span>
          </div>

          <!-- Três situações, três resultados:
               dono -> "Editar Perfil"; logado e de outra pessoa -> "Seguir"
               (ainda sem ação); visitante -> nenhum dos dois. -->
          <router-link v-if="profile.isOwner" to="/perfil" class="btn btn-sm btn-brand">
            <i class="bi bi-pencil-square me-1"></i>Editar Perfil
          </router-link>
          <button v-else-if="isAuthenticated" type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-person-plus me-1"></i>Seguir
          </button>
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
