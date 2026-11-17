<script setup>
import { reactive } from 'vue'
import BaseModal from '../base/BaseModal.vue'
import { useAsyncData } from '../../composables/useAsyncData'
import { runOptimistic } from '../../utils/optimistic'
import {
  getRoutinesStatus,
  addWorkoutToRoutine,
  removeWorkoutFromRoutine,
} from '../../services/routineService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  workoutId: { type: [Number, String], required: true },
})
const emit = defineEmits(['update:modelValue'])

// As MINHAS rotinas, cada uma com hasWorkout (o treino já está nela?). O
// modal já abre com as caixas marcadas conforme o servidor.
const { data: routines, isLoading, error } = useAsyncData(
  () => getRoutinesStatus(props.workoutId).then((response) => response.data),
  { initialData: [] }
)

// "Cerca" POR LINHA: ids de rotinas com uma requisição em andamento. Dois
// cliques rápidos na mesma caixa geram UMA requisição, mas as outras caixas
// continuam livres (um isBusy único travaria o modal inteiro).
const busyIds = reactive(new Set())

function toggle(routine) {
  if (busyIds.has(routine.id)) return
  busyIds.add(routine.id)

  // Estado de ANTES, guardado numa variável local: é ele que decide se a
  // requisição é de adicionar ou de remover (a caixa já mudou na tela).
  const wasSaved = routine.hasWorkout

  runOptimistic({
    apply() {
      routine.hasWorkout = !wasSaved
      routine.treinosCount += wasSaved ? -1 : 1
      return () => {
        routine.hasWorkout = wasSaved
        routine.treinosCount += wasSaved ? 1 : -1
      }
    },
    request: () =>
      wasSaved
        ? removeWorkoutFromRoutine(routine.id, props.workoutId)
        : addWorkoutToRoutine(routine.id, props.workoutId),
    // O servidor só corrige o contador (a caixa já está certa).
    confirm(data) {
      routine.treinosCount = data.treinosCount
    },
  }).finally(() => busyIds.delete(routine.id))
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Salvar em uma rotina"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p v-if="isLoading" class="text-muted mb-0">Carregando suas rotinas...</p>

    <p v-else-if="error" class="alert alert-danger mb-0" role="alert">{{ error }}</p>

    <p v-else-if="routines.length === 0" class="mb-0">
      Você ainda não tem rotinas.
      <router-link to="/minhas-rotinas" class="brand-text" @click="emit('update:modelValue', false)">
        Criar a primeira
      </router-link>
    </p>

    <ul v-else class="list-unstyled mb-0">
      <li v-for="routine in routines" :key="routine.id" class="form-check d-flex align-items-center gap-2 py-1">
        <!-- :checked (só de ida) + @change: a caixa mostra o estado dos dados
             e o clique chama toggle. Com v-model, a caixa mudaria sozinha e
             o rollback não teria como "puxar" ela de volta. -->
        <input
          :id="`routine-${routine.id}`"
          type="checkbox"
          class="form-check-input mt-0"
          :checked="routine.hasWorkout"
          :disabled="busyIds.has(routine.id)"
          @change="toggle(routine)"
        />
        <label :for="`routine-${routine.id}`" class="form-check-label flex-grow-1">
          <i v-if="!routine.isPublic" class="bi bi-lock-fill text-muted me-1" title="Privada"></i>
          {{ routine.title }}
        </label>
        <span class="text-muted small">{{ routine.treinosCount }}</span>
      </li>
    </ul>
  </BaseModal>
</template>
