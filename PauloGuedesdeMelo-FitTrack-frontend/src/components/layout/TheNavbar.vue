<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { isAuthenticated, username, logout } = useAuth()

async function handleLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark px-3" style="background-color: #1a1a1a;">
    <router-link to="/" class="navbar-brand navbar-brand-fittrack">
      <i class="bi bi-activity me-1"></i>FitTrack
    </router-link>

    <div class="d-flex flex-wrap gap-3 align-items-center ms-auto">
      <router-link to="/feed" class="nav-link-custom">
        <i class="bi bi-collection-play me-1"></i>Feed
      </router-link>
      <router-link to="/busca" class="nav-link-custom">
        <i class="bi bi-search me-1"></i>Buscar
      </router-link>

      <template v-if="isAuthenticated">
        <router-link to="/notificacoes" class="nav-link-custom">
          <i class="bi bi-bell me-1"></i>Notificações
        </router-link>
        <router-link to="/perfil" class="nav-link-custom">
          <i class="bi bi-person-circle me-1"></i>Meu Perfil
        </router-link>
        <span class="text-white-50 small">Olá, {{ username }}</span>
        <button type="button" class="btn btn-sm btn-outline-light" @click="handleLogout">
          <i class="bi bi-box-arrow-right me-1"></i>Sair
        </button>
      </template>

      <template v-else>
        <router-link to="/register" class="nav-link-custom">
          <i class="bi bi-person-plus me-1"></i>Criar Conta
        </router-link>
        <router-link to="/login" class="nav-link-custom">
          <i class="bi bi-box-arrow-in-right me-1"></i>Entrar
        </router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.nav-link-custom {
  color: #ddd;
}
.nav-link-custom:hover {
  color: #fff;
}
</style>
