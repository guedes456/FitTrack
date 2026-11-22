<script setup>
import { ref } from 'vue'
import { useDebouncedValue } from '../../composables/useDebouncedValue'
import { usePaginatedList } from '../../composables/usePaginatedList'
import { useToast } from '../../composables/useToast'
import { SEARCH } from '../../config/constants'
import { getAdminWorkouts, deleteAdminWorkout } from '../../services/adminService'
import { getWorkoutImageUrl } from '../../utils/media'
import BaseButton from '../../components/base/BaseButton.vue'
import ConfirmModal from '../../components/base/ConfirmModal.vue'

const toast = useToast()

const typedText = ref('')
const term = useDebouncedValue(typedText, SEARCH.DEBOUNCE_MS)

const { items, hasMore, isLoading, error, loadMore } = usePaginatedList(
  (page, limit) => getAdminWorkouts(term.value.trim(), page, limit),
  { watch: term }
)

// Interruptor E dado do modal (como o userToBlock da tela de usuários).
const workoutToDelete = ref(null)
const isDeleting = ref(false)

// Espera o servidor: o treino só sai da lista DEPOIS do sucesso. Se a exclusão
// falhar, a linha e o modal continuam como estavam (o toast é do interceptor).
async function confirmDelete() {
  if (isDeleting.value || !workoutToDelete.value) return
  const workout = workoutToDelete.value
  isDeleting.value = true

  try {
    const response = await deleteAdminWorkout(workout.id)
    items.value = items.value.filter((item) => item.id !== workout.id)
    toast.success(response.message)
    workoutToDelete.value = null
  } catch {
    // O toast de erro é do interceptor.
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section aria-labelledby="treinos-title">
    <h2 id="treinos-title" class="h5 mb-3">Treinos</h2>

    <div class="mb-3">
      <label for="workout-search" class="form-label visually-hidden">Buscar treinos</label>
      <input
        id="workout-search"
        v-model="typedText"
        type="search"
        class="form-control"
        placeholder="Buscar pelo título do treino"
        autocomplete="off"
      />
    </div>

    <p v-if="isLoading && items.length === 0" class="text-muted">Carregando treinos...</p>

    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <p v-else-if="items.length === 0" class="text-muted">Nenhum treino encontrado.</p>

    <template v-else>
      <ul class="list-unstyled mb-3">
        <li v-for="workout in items" :key="workout.id" class="workout-row d-flex align-items-center gap-3 p-2 mb-2 rounded">
          <router-link :to="{ name: 'treino-detail', params: { id: workout.id } }">
            <img :src="getWorkoutImageUrl(workout.image)" :alt="`Imagem do treino ${workout.title}`" class="thumb" />
          </router-link>

          <div class="flex-grow-1">
            <router-link :to="{ name: 'treino-detail', params: { id: workout.id } }" class="fw-semibold">
              {{ workout.title }}
            </router-link>
            <div class="text-muted small">
              <template v-if="workout.user">de @{{ workout.user.username }}</template>
              <span v-if="workout.pendingReportsCount > 0" class="badge text-bg-danger ms-2">
                {{ workout.pendingReportsCount }}
                {{ workout.pendingReportsCount === 1 ? 'denúncia pendente' : 'denúncias pendentes' }}
              </span>
            </div>
          </div>

          <button type="button" class="btn btn-sm btn-outline-danger" @click="workoutToDelete = workout">
            Excluir
          </button>
        </li>
      </ul>

      <div v-if="hasMore" class="text-center">
        <BaseButton type="button" variant="outline" :block="false" :loading="isLoading" loading-text="Carregando..." @click="loadMore">
          Carregar mais treinos
        </BaseButton>
      </div>
    </template>

    <ConfirmModal
      v-if="workoutToDelete"
      title="Excluir treino"
      :message="`Excluir o treino “${workoutToDelete.title}”? Serão apagados também as curtidas, os comentários, as denúncias, as notificações e a imagem dele, e ele sai das rotinas que o contêm. Não dá para desfazer.`"
      confirm-label="Excluir treino"
      :busy="isDeleting"
      @confirm="confirmDelete"
      @close="workoutToDelete = null"
    />
  </section>
</template>

<style scoped>
.workout-row {
  background: #fff;
  border: 1px solid #e5e5e5;
}
.thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 0.375rem;
}
</style>
