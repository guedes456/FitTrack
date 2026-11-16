<!--
  Checagem de alcançabilidade (Atividade 11):
  - Feed de quem eu sigo: 1 clique a partir de qualquer tela com Sidebar, no
    item "Feed Seguindo" (to="/feed/seguindo"). O router tem esse MESMO path
    (rota 'feed-following'), então o link não leva a lugar nenhum quebrado.
-->
<script setup>
import { usePaginatedList } from '../composables/usePaginatedList'
import { getFollowingWorkouts } from '../services/followService'
import WorkoutCard from '../components/workout/WorkoutCard.vue'
import BaseButton from '../components/base/BaseButton.vue'

const { items: workouts, hasMore, isLoading, error, loadMore } = usePaginatedList(getFollowingWorkouts)
</script>

<template>
  <div class="p-4">
    <h1 class="h3 mb-3 brand-title">Feed Seguindo</h1>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <div v-if="isLoading && workouts.length === 0" class="text-muted">Carregando treinos...</div>

    <div v-else-if="!error && workouts.length === 0" class="text-muted">
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
        @click="loadMore"
      >
        Carregar mais
      </BaseButton>
    </div>
  </div>
</template>
