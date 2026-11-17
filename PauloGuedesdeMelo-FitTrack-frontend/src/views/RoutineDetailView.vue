<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '../composables/useAsyncData'
import { useToast } from '../composables/useToast'
import { useAuth } from '../composables/useAuth'
import { MESSAGES } from '../config/constants'
import { getRoutineById, removeWorkoutFromRoutine } from '../services/routineService'
import { getProfilePictureUrl } from '../utils/media'
import WorkoutCard from '../components/workout/WorkoutCard.vue'

const route = useRoute()
const toast = useToast()
const { isAuthenticated } = useAuth()

// 403 (privada) e 404 (não existe) chegam como erro e aparecem NO LUGAR do
// conteúdo, sem toast: leitura que falha é da tela.
const { data: routine, isLoading, error } = useAsyncData(
  () => getRoutineById(route.params.id).then((response) => response.data),
  { watch: () => route.params.id }
)

// id do treino cuja remoção está em andamento (desabilita só o botão dele).
const removingId = ref(null)

// PESSIMISTA: chama a API e SÓ DEPOIS tira o card da lista e usa o contador
// que o servidor devolveu. Se falhar, o card fica (toast de erro: interceptor).
async function removeItem(workout) {
  removingId.value = workout.id
  try {
    const response = await removeWorkoutFromRoutine(routine.value.id, workout.id)
    routine.value = {
      ...routine.value,
      treinos: routine.value.treinos.filter((item) => item.id !== workout.id),
      treinosCount: response.data.treinosCount,
    }
    toast.success(MESSAGES.WORKOUT_REMOVED_FROM_ROUTINE)
  } catch {
    // Já avisado pelo interceptor; o card continua na lista.
  } finally {
    removingId.value = null
  }
}
</script>

<template>
  <div class="p-4">
    <div v-if="isLoading" class="text-muted">Carregando rotina...</div>

    <div v-else-if="error" class="alert alert-warning" role="alert">
      <p class="mb-2">{{ error }}</p>
      <router-link
        :to="isAuthenticated ? '/minhas-rotinas' : '/feed'"
        class="btn btn-sm btn-outline-secondary"
      >
        <i class="bi bi-arrow-left me-1"></i>{{ isAuthenticated ? 'Minhas Rotinas' : 'Voltar ao Feed' }}
      </router-link>
    </div>

    <section v-else-if="routine">
      <router-link
        :to="routine.isOwner ? '/minhas-rotinas' : '/feed'"
        class="small text-muted"
      >
        <i class="bi bi-arrow-left me-1"></i>{{ routine.isOwner ? 'Minhas Rotinas' : 'Voltar ao Feed' }}
      </router-link>

      <div class="d-flex align-items-center gap-2 mt-2">
        <h1 class="h3 mb-0 brand-title">{{ routine.title }}</h1>
        <span class="badge" :class="routine.isPublic ? 'text-bg-success' : 'text-bg-secondary'">
          {{ routine.isPublic ? 'Pública' : 'Privada' }}
        </span>
      </div>

      <p v-if="routine.description" class="mt-2 mb-2" style="white-space: pre-line;">
        {{ routine.description }}
      </p>

      <div class="d-flex align-items-center gap-2 text-muted small mb-3">
        <router-link
          v-if="routine.user"
          :to="{ name: 'public-profile', params: { username: routine.user.username } }"
          class="d-flex align-items-center gap-2 text-muted text-decoration-none"
        >
          <img :src="getProfilePictureUrl(routine.user.profilePicture)" alt="" class="avatar-sm" />
          <span>{{ routine.user.fullName || routine.user.username }}</span>
        </router-link>
        <span>·</span>
        <span>{{ routine.treinosCount === 1 ? '1 treino' : `${routine.treinosCount} treinos` }}</span>
      </div>

      <p v-if="routine.treinos.length === 0" class="text-muted">
        <template v-if="routine.isOwner">
          Esta rotina está vazia. Abra um treino e use o botão <strong>Salvar</strong> para guardá-lo aqui.
        </template>
        <template v-else>Esta rotina ainda não tem treinos.</template>
      </p>

      <div v-else class="workout-grid">
        <WorkoutCard v-for="workout in routine.treinos" :key="workout.id" :workout="workout">
          <!-- v-if no slot: só a dona vê o botão (e o slot nem é criado para
               os outros). Esconder é conforto; quem bloqueia é a API (403). -->
          <template v-if="routine.isOwner" #actions>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              :disabled="removingId === workout.id"
              @click="removeItem(workout)"
            >
              <i class="bi bi-x-lg me-1"></i>Remover da rotina
            </button>
          </template>
        </WorkoutCard>
      </div>
    </section>
  </div>
</template>
