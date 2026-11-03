<script setup>
// Checagem de alcançabilidade (Atividade 11):
//  - Feed filtrado: 1 clique a partir de qualquer tela logada, pelo item
//    "Feed Seguindo" da Sidebar (router-link to="/feed/seguindo", que já
//    existia desde a Aula 06 e agora aponta para esta tela de verdade).
import { ref, onMounted } from 'vue'
import { getFollowingWorkouts } from '../services/followService'
import WorkoutCard from '../components/workout/WorkoutCard.vue'
import BaseButton from '../components/base/BaseButton.vue'

const LIMIT = 12

const workouts = ref([])
const currentPage = ref(0)
const hasMore = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

async function loadPage(page) {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await getFollowingWorkouts(page, LIMIT)
    const { items, hasMore: more } = response.data

    // Mesmo cuidado do Feed Geral: ignora ids já exibidos, caso a lista
    // "deslize" entre uma página e outra.
    const knownIds = new Set(workouts.value.map((w) => w.id))
    workouts.value.push(...items.filter((w) => !knownIds.has(w.id)))

    currentPage.value = page
    hasMore.value = more
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadPage(1))
</script>

<template>
  <div class="p-4">
    <h1 class="h3 mb-3 brand-title">Feed Seguindo</h1>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div v-if="isLoading && workouts.length === 0" class="text-muted">
      Carregando treinos...
    </div>

    <div v-else-if="!errorMessage && workouts.length === 0" class="text-muted">
      Nada por aqui ainda: você não segue ninguém ou quem você segue ainda não publicou treinos.
      <router-link to="/feed" class="brand-text">Descubra pessoas no Feed Geral.</router-link>
    </div>

    <div v-else class="workout-grid">
      <WorkoutCard v-for="workout in workouts" :key="workout.id" :workout="workout" />
    </div>

    <div v-if="hasMore" class="text-center mt-4">
      <BaseButton
        type="button"
        :block="false"
        :loading="isLoading"
        loading-text="Carregando..."
        @click="loadPage(currentPage + 1)"
      >
        Carregar mais
      </BaseButton>
    </div>
  </div>
</template>
