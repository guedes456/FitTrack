<script setup>
import { computed } from 'vue'
import { useAsyncData } from '../../composables/useAsyncData'
import { getAdminDashboard } from '../../services/adminService'

// useAsyncData recebe uma FUNÇÃO: ele decide quando chamar (ao montar e no
// "Atualizar"). `data` guarda o envelope da API; os números estão em data.data.
const { data, error, isLoading, reload: execute } = useAsyncData(getAdminDashboard)
const stats = computed(() => data.value?.data ?? {})

// Cartões iguais: um v-for só. O das denúncias pendentes é diferente (vermelho
// e clicável), por isso fica fora da lista.
const cards = [
  { key: 'users', label: 'Usuários', icon: 'bi-people' },
  { key: 'blockedUsers', label: 'Usuários bloqueados', icon: 'bi-person-slash' },
  { key: 'workouts', label: 'Treinos', icon: 'bi-clipboard-data' },
  { key: 'comments', label: 'Comentários', icon: 'bi-chat-left-text' },
  { key: 'likes', label: 'Curtidas', icon: 'bi-heart' },
  { key: 'reviewedReports', label: 'Denúncias revisadas', icon: 'bi-check2-circle' },
]
</script>

<template>
  <section aria-labelledby="dashboard-title">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 id="dashboard-title" class="h5 mb-0">Dashboard</h2>
      <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="isLoading" @click="execute">
        <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
      </button>
    </div>

    <!-- Ordem: carregando -> erro -> conteúdo. Um 403 (sem papel) aparece
         aqui, NO LUGAR dos números. -->
    <p v-if="isLoading" class="text-muted">Carregando dashboard...</p>

    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <div v-else class="row g-3">
      <div v-for="card in cards" :key="card.key" class="col-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="text-muted small"><i class="bi me-1" :class="card.icon"></i>{{ card.label }}</div>
            <div class="display-6 fw-semibold">{{ stats[card.key] }}</div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <router-link :to="{ name: 'admin-reports' }" class="card h-100 text-decoration-none text-white bg-danger">
          <div class="card-body">
            <div class="small"><i class="bi bi-flag me-1"></i>Denúncias pendentes</div>
            <div class="display-6 fw-semibold">{{ stats.pendingReports }}</div>
            <div class="small">Ver denúncias</div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>
