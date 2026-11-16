<script setup>
import { usePaginatedList } from '../composables/usePaginatedList'
import { getFeed } from '../services/userService'
import WorkoutCard from '../components/workout/WorkoutCard.vue'
import BaseButton from '../components/base/BaseButton.vue'

const { items: workouts, hasMore, isLoading, error, loadMore } = usePaginatedList(getFeed)
</script>

<template>
  <div class="p-4">
    <h1 class="h3 mb-3 brand-title">Feed Geral</h1>

    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-if="isLoading && workouts.length === 0" class="text-muted">
      Carregando treinos...
    </div>

    <div v-else-if="!error && workouts.length === 0" class="text-muted">
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
        @click="loadMore"
      >
        Carregar mais
      </BaseButton>
    </div>
  </div>
</template>
