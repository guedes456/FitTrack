<script setup>
import { reactive, ref } from 'vue'
import { usePaginatedList } from '../../composables/usePaginatedList'
import { useToast } from '../../composables/useToast'
import { REPORT_FILTERS, REPORT_REASONS } from '../../config/constants'
import { getAdminReports, reviewAdminReport } from '../../services/adminService'
import { getWorkoutImageUrl } from '../../utils/media'
import { formatDateTime } from '../../utils/format'
import BaseButton from '../../components/base/BaseButton.vue'

const toast = useToast()

const statusFilter = ref('pending')

// A RECEITA lê statusFilter.value a cada chamada; o `watch` faz a lista
// recomeçar da página 1 quando o filtro muda.
const { items, hasMore, isLoading, error, loadMore, reload } = usePaginatedList(
  (page, limit) => getAdminReports(statusFilter.value, page, limit),
  { watch: statusFilter }
)

// A API guarda a CHAVE do motivo; aqui a chave vira o rótulo em português.
const reasonLabels = Object.fromEntries(REPORT_REASONS.map((reason) => [reason.key, reason.label]))

// Cerca por linha: dois cliques na mesma denúncia = UMA requisição.
const busyIds = reactive(new Set())

// SEM atualização otimista: a linha só muda DEPOIS da resposta, e com o que a
// API devolveu (o reviewedAt é o do servidor). Se falhar, a linha continua
// pendente e o toast de erro já foi mostrado pelo interceptor.
async function markAsReviewed(report) {
  if (busyIds.has(report.id)) return
  busyIds.add(report.id)

  try {
    const response = await reviewAdminReport(report.id)
    report.status = response.data.status
    report.reviewedAt = response.data.reviewedAt
    toast.success(response.message)
  } catch {
    // O toast de erro é do interceptor do Axios; outro aqui duplicaria o aviso.
  } finally {
    busyIds.delete(report.id)
  }
}
</script>

<template>
  <section aria-labelledby="reports-title">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <h2 id="reports-title" class="h5 mb-0">Denúncias</h2>

      <div class="d-flex align-items-center gap-2">
        <div class="btn-group btn-group-sm" role="group" aria-label="Filtrar denúncias por situação">
          <button
            v-for="filter in REPORT_FILTERS"
            :key="filter.value"
            type="button"
            class="btn"
            :class="statusFilter === filter.value ? 'btn-dark' : 'btn-outline-secondary'"
            :aria-pressed="statusFilter === filter.value"
            @click="statusFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
        <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="isLoading" @click="reload">
          <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
        </button>
      </div>
    </div>

    <p v-if="isLoading && items.length === 0" class="text-muted">Carregando denúncias...</p>

    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <p v-else-if="items.length === 0" class="text-muted">Nenhuma denúncia neste filtro.</p>

    <template v-else>
      <ul class="list-unstyled mb-3">
        <li v-for="report in items" :key="report.id" class="report-row d-flex align-items-center gap-3 p-2 mb-2 rounded">
          <router-link :to="{ name: 'treino-detail', params: { id: report.workout.id } }">
            <img :src="getWorkoutImageUrl(report.workout.image)" :alt="`Imagem do treino ${report.workout.title}`" class="thumb" />
          </router-link>

          <div class="flex-grow-1">
            <div>
              <router-link :to="{ name: 'treino-detail', params: { id: report.workout.id } }" class="fw-semibold">
                {{ report.workout.title }}
              </router-link>
              <span v-if="report.workout.user" class="text-muted small"> · de @{{ report.workout.user.username }}</span>
            </div>
            <div class="small">
              <span class="badge text-bg-secondary me-1">{{ reasonLabels[report.reason] || report.reason }}</span>
              <span class="badge me-1" :class="report.status === 'pending' ? 'text-bg-danger' : 'text-bg-success'">
                {{ report.status === 'pending' ? 'Pendente' : 'Revisada' }}
              </span>
            </div>
            <div class="text-muted small">
              Denunciado por @{{ report.reporter?.username }} em {{ formatDateTime(report.createdAt) }}
              <template v-if="report.reviewedAt"> · revisada em {{ formatDateTime(report.reviewedAt) }}</template>
            </div>
          </div>

          <button
            v-if="report.status === 'pending'"
            type="button"
            class="btn btn-sm btn-outline-success"
            :disabled="busyIds.has(report.id)"
            @click="markAsReviewed(report)"
          >
            {{ busyIds.has(report.id) ? 'Salvando...' : 'Marcar como revisada' }}
          </button>
        </li>
      </ul>

      <div v-if="hasMore" class="text-center">
        <BaseButton type="button" variant="outline" :block="false" :loading="isLoading" loading-text="Carregando..." @click="loadMore">
          Carregar mais denúncias
        </BaseButton>
      </div>
    </template>
  </section>
</template>

<style scoped>
.report-row {
  background: #fff;
  border: 1px solid #e5e5e5;
}
.thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 0.375rem;
}
</style>
