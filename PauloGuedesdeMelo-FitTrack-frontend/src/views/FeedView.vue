<script setup>
import { ref, onMounted } from 'vue'
import { getFeed } from '../services/userService'
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
    const response = await getFeed(page, LIMIT)
    const { items, hasMore: more } = response.data

    // Se alguém publicou um treino novo enquanto o usuário rolava, os
    // registros "deslizam" uma posição e o último da página anterior pode
    // reaparecer no começo da próxima — por isso ignoramos ids já exibidos.
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
    <h1 class="h3 mb-3 brand-title">Feed Geral</h1>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div v-if="isLoading && workouts.length === 0" class="text-muted">
      Carregando treinos...
    </div>

    <div v-else-if="!errorMessage && workouts.length === 0" class="text-muted">
      Nenhum treino por aqui ainda.
      <router-link to="/upload" class="brand-text">Envie o primeiro!</router-link>
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
