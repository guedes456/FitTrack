<script setup>
import { useAsyncData } from '../composables/useAsyncData'
import { getLikedWorkouts } from '../services/likeService'
import WorkoutCard from '../components/workout/WorkoutCard.vue'

// Carrega a cada vez que a tela abre: descurtir um treino no detalhe e voltar
// para cá já mostra a lista sem ele.
const { data: workouts, isLoading, error } = useAsyncData(
  () => getLikedWorkouts().then((response) => response.data)
)
</script>

<template>
  <div class="p-4">
    <h1 class="h3 mb-3 brand-title">Treinos curtidos</h1>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-else-if="isLoading" class="text-muted">Carregando...</div>
    <div v-else-if="!workouts || workouts.length === 0" class="text-muted">
      Você ainda não curtiu nenhum treino.
      <router-link to="/feed" class="brand-text">Ver o Feed</router-link>
    </div>
    <div v-else class="workout-grid">
      <WorkoutCard v-for="workout in workouts" :key="workout.id" :workout="workout" />
    </div>
  </div>
</template>
