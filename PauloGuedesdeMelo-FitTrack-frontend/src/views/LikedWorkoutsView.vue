<script setup>
import { ref, onMounted } from 'vue'
import { getLikedWorkouts } from '../services/likeService'
import WorkoutCard from '../components/workout/WorkoutCard.vue'

const workouts = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// Carrega a cada vez que a tela abre: descurtir um treino no detalhe e voltar
// para cá já mostra a lista sem ele.
onMounted(async () => {
  try {
    const response = await getLikedWorkouts()
    workouts.value = response.data
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="p-4">
    <h1 class="h3 mb-3 brand-title">Treinos curtidos</h1>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
    <div v-else-if="isLoading" class="text-muted">Carregando...</div>
    <div v-else-if="workouts.length === 0" class="text-muted">
      Você ainda não curtiu nenhum treino.
      <router-link to="/feed" class="brand-text">Ver o Feed</router-link>
    </div>
    <div v-else class="workout-grid">
      <WorkoutCard v-for="workout in workouts" :key="workout.id" :workout="workout" />
    </div>
  </div>
</template>
