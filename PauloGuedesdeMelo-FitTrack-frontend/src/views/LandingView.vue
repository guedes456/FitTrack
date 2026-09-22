<script setup>
import { ref, onMounted } from 'vue'
import { getApiStatus } from '../services/systemService'

const apiStatus = ref('verificando...')

onMounted(async () => {
  try {
    const response = await getApiStatus()
    apiStatus.value = response.data.status // "online"
  } catch (error) {
    apiStatus.value = 'offline'
    console.error('Erro ao consultar a API:', error.message)
  }
})
</script>

<template>
  <div class="landing p-4">
    <h1>Bem-vindo ao FitTrack</h1>
    <p>Acompanhe treinos personalizados, assista vídeos de exercícios e registre seu progresso.</p>
    <p>Status da API: <strong>{{ apiStatus }}</strong></p>
  </div>
</template>
