<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getWorkoutById } from '../services/userService'
import { getWorkoutImageUrl, getProfilePictureUrl } from '../utils/media'

const route = useRoute()

const workout = ref(null)
// Vem da API (true só quando o token enviado é do dono do treino). Ainda não
// aparece na tela: na Aula 09 vai decidir se os botões de editar/excluir
// são exibidos.
const isOwner = ref(false)
const isLoading = ref(true)
const errorMessage = ref('')

async function loadWorkout(id) {
  isLoading.value = true
  errorMessage.value = ''
  workout.value = null

  try {
    const response = await getWorkoutById(id)
    workout.value = response.data
    isOwner.value = response.data.isOwner
  } catch (error) {
    // 404 (treino inexistente) ou falha de rede: a tela mostra a mensagem
    // da API em vez de quebrar.
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

// immediate: carrega ao abrir a tela; e recarrega se o :id da URL mudar
// sem a tela ser recriada.
watch(() => route.params.id, (id) => loadWorkout(id), { immediate: true })

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div class="p-4">
    <div v-if="isLoading" class="text-muted">Carregando treino...</div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      <p class="mb-2">{{ errorMessage }}</p>
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
        <img
          :src="getProfilePictureUrl(workout.user?.profilePicture)"
          alt=""
          class="avatar-sm"
        />
        <span>{{ workout.user?.fullName || workout.user?.username }}</span>
        <span>·</span>
        <span>{{ formatDate(workout.createdAt) }}</span>
        <span>·</span>
        <span><i class="bi bi-eye me-1"></i>{{ workout.viewsCount }}</span>
      </div>

      <!-- Grupo B: a imagem É o conteúdo, então é só uma <img> em resolução
           real apontando para o arquivo estático (sem player e sem header
           Authorization, que uma tag <img> não consegue enviar). -->
      <img
        :src="getWorkoutImageUrl(workout.image)"
        :alt="workout.title"
        class="workout-detail-img"
      />

      <p v-if="workout.description" class="mt-3" style="white-space: pre-line;">
        {{ workout.description }}
      </p>
    </article>
  </div>
</template>
