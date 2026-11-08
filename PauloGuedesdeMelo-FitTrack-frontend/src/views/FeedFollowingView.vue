<!--
  Checagem de alcançabilidade (Atividade 11):
  - Feed de quem eu sigo: 1 clique a partir de qualquer tela com Sidebar, no
    item "Feed Seguindo" (to="/feed/seguindo"). O router tem esse MESMO path
    (rota 'feed-following'), então o link não leva a lugar nenhum quebrado.
-->
<script setup>
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

    // Ignora ids já exibidos (um treino novo pode "deslizar" a paginação).
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

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>

    <div v-if="isLoading && workouts.length === 0" class="text-muted">Carregando treinos...</div>

    <div v-else-if="!errorMessage && workouts.length === 0" class="text-muted">
      Nada por aqui ainda: você não segue ninguém, ou quem você segue ainda não publicou.
      <router-link to="/feed" class="brand-text">Ver o Feed Geral</router-link>
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
