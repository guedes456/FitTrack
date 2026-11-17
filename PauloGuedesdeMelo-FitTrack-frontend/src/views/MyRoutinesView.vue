<script setup>
import { ref } from 'vue'
import { useAsyncData } from '../composables/useAsyncData'
import { useToast } from '../composables/useToast'
import { MESSAGES } from '../config/constants'
import { getMyRoutines, deleteRoutine } from '../services/routineService'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import CreateRoutineModal from '../components/routine/CreateRoutineModal.vue'

const toast = useToast()

// initialData: [] — a lista nunca é null, então o template pode usar
// routines.length sem checar.
const { data: routines, isLoading, error } = useAsyncData(
  () => getMyRoutines().then((response) => response.data),
  { initialData: [] }
)

const isCreating = ref(false)
const routineToDelete = ref(null)
const isDeleting = ref(false)

function handleCreated(routine) {
  // A nova entra no TOPO, num array NOVO (o Vue percebe a troca).
  routines.value = [routine, ...routines.value]
  toast.success('Rotina criada com sucesso!')
}

function askDelete(routine) {
  routineToDelete.value = routine
}

function cancelDelete() {
  routineToDelete.value = null
}

// PESSIMISTA: espera a API. Se falhar, a rotina continua na lista e o modal
// continua aberto (o toast de erro é do interceptor).
async function confirmDelete() {
  isDeleting.value = true
  try {
    const deletedId = routineToDelete.value.id
    await deleteRoutine(deletedId)
    routines.value = routines.value.filter((routine) => routine.id !== deletedId)
    routineToDelete.value = null
    toast.success(MESSAGES.ROUTINE_DELETED)
  } catch {
    // Já avisado pelo interceptor.
  } finally {
    isDeleting.value = false
  }
}

function treinosLabel(count) {
  return count === 1 ? '1 treino' : `${count} treinos`
}
</script>

<template>
  <div class="p-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h3 mb-0 brand-title">Minhas Rotinas</h1>
      <button type="button" class="btn btn-brand btn-sm" @click="isCreating = true">
        <i class="bi bi-plus-lg me-1"></i>Nova rotina
      </button>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <div v-else-if="isLoading" class="text-muted">Carregando suas rotinas...</div>

    <div v-else-if="routines.length === 0" class="text-muted">
      Você ainda não tem rotinas. Clique em <strong>Nova rotina</strong> para criar a primeira
      e depois use o botão <strong>Salvar</strong> na página de um treino para guardá-lo nela.
    </div>

    <div v-else class="routine-grid">
      <article v-for="routine in routines" :key="routine.id" class="card routine-card position-relative">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <h2 class="h6 mb-1">
              <!-- stretched-link: o <a> estica e cobre o cartão inteiro, então
                   o cartão todo é clicável sem aninhar o botão Excluir dentro
                   de um link (HTML inválido). -->
              <router-link
                :to="{ name: 'routine-detail', params: { id: routine.id } }"
                class="stretched-link text-decoration-none routine-title"
              >
                {{ routine.title }}
              </router-link>
            </h2>
            <span class="badge" :class="routine.isPublic ? 'text-bg-success' : 'text-bg-secondary'">
              {{ routine.isPublic ? 'Pública' : 'Privada' }}
            </span>
          </div>
          <p v-if="routine.description" class="text-muted small mb-2 routine-description">
            {{ routine.description }}
          </p>
          <div class="text-muted small">{{ treinosLabel(routine.treinosCount) }}</div>
        </div>
        <div class="card-footer bg-transparent border-0 pt-0">
          <!-- position-relative + z-index: o botão fica POR CIMA do link
               esticado; sem isso o clique em Excluir abriria a rotina. -->
          <button
            type="button"
            class="btn btn-sm btn-outline-danger position-relative routine-delete"
            @click="askDelete(routine)"
          >
            <i class="bi bi-trash me-1"></i>Excluir
          </button>
        </div>
      </article>
    </div>

    <CreateRoutineModal v-model="isCreating" @created="handleCreated" />

    <BaseModal
      :model-value="routineToDelete !== null"
      title="Excluir rotina"
      :busy="isDeleting"
      @update:model-value="cancelDelete"
    >
      <p class="mb-1">
        Tem certeza que quer excluir <strong>{{ routineToDelete?.title }}</strong>?
      </p>
      <p class="text-muted small mb-0">Os treinos continuam existindo; só saem desta rotina.</p>

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

<style scoped>
.routine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.routine-title {
  color: inherit;
}
.routine-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}
.routine-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.routine-delete {
  z-index: 2;
}
</style>
