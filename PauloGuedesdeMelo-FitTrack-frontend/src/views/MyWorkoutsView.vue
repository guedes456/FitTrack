<script setup>
import { ref, onMounted } from 'vue'
import { getMyWorkouts, deleteWorkout } from '../services/userService'
import WorkoutCard from '../components/workout/WorkoutCard.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'

const workouts = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// Treino que o usuário clicou em "Excluir" (null = modal fechado).
const workoutToDelete = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')

onMounted(async () => {
  try {
    const response = await getMyWorkouts()
    workouts.value = response.data
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
})

function askDelete(workout) {
  deleteError.value = ''
  workoutToDelete.value = workout
}

function cancelDelete() {
  workoutToDelete.value = null
}

async function confirmDelete() {
  isDeleting.value = true
  deleteError.value = ''

  try {
    await deleteWorkout(workoutToDelete.value.id)
    // Remoção local: tira o item da lista que já está na tela, sem
    // precisar buscar tudo de novo nem recarregar a página.
    const deletedId = workoutToDelete.value.id
    workouts.value = workouts.value.filter((w) => w.id !== deletedId)
    workoutToDelete.value = null
  } catch (error) {
    deleteError.value = error.message
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="h3 mb-3 brand-title">Meus Itens</h1>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>

    <div v-else-if="isLoading" class="text-muted">Carregando seus treinos...</div>

    <div v-else-if="workouts.length === 0" class="text-muted">
      Você ainda não enviou nenhum treino.
      <router-link to="/upload" class="brand-text">Enviar o primeiro</router-link>
    </div>

    <div v-else class="workout-grid">
      <WorkoutCard v-for="workout in workouts" :key="workout.id" :workout="workout" :show-author="false">
        <template #actions>
          <router-link
            :to="{ name: 'workout-edit', params: { id: workout.id } }"
            class="btn btn-sm btn-outline-secondary"
          >
            <i class="bi bi-pencil me-1"></i>Editar
          </router-link>
          <!-- Botão FORA de qualquer <a>: clicar nele só abre o modal, sem
               navegar para o detalhe. -->
          <button type="button" class="btn btn-sm btn-outline-danger" @click="askDelete(workout)">
            <i class="bi bi-trash me-1"></i>Excluir
          </button>
        </template>
      </WorkoutCard>
    </div>

    <!-- Um único modal para a tela toda, FORA do card e da grade: dentro de
         cada card ele ficaria preso ao tamanho/posição do card (e herdaria
         overflow e transform), em vez de centralizado na tela. -->
    <BaseModal
      :model-value="workoutToDelete !== null"
      title="Excluir treino"
      :busy="isDeleting"
      @update:model-value="cancelDelete"
    >
      <p class="mb-1">
        Tem certeza que quer excluir
        <strong>{{ workoutToDelete?.title }}</strong>?
      </p>
      <p class="text-muted small mb-0">Essa ação não pode ser desfeita.</p>
      <p v-if="deleteError" class="alert alert-danger py-2 mt-3 mb-0">{{ deleteError }}</p>

      <template #footer>
        <BaseButton type="button" variant="outline" :block="false" :loading="false" @click="cancelDelete">
          Cancelar
        </BaseButton>
        <BaseButton
          type="button"
          variant="danger"
          :block="false"
          :loading="isDeleting"
          loading-text="Excluindo..."
          @click="confirmDelete"
        >
          Excluir
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
