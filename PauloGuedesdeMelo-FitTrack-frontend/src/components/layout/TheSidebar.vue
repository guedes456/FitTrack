<script setup>
import { useAuth } from '../../composables/useAuth'

// Sidebar só mostra os links de uma seção protegida quando o usuário tem
// acesso a ela — evita levar a um redirecionamento de login/landing só
// por clicar num item que já sabíamos de antemão que ia barrar.
const { isAuthenticated, isAdmin } = useAuth()
</script>

<template>
  <aside class="sidebar">
    <router-link to="/feed">
      <i class="bi bi-collection-play me-2"></i>Feed Geral
    </router-link>
    <router-link to="/feed/seguindo" v-if="isAuthenticated">
      <i class="bi bi-people me-2"></i>Feed Seguindo
    </router-link>
    <router-link to="/sugestoes" v-if="isAuthenticated">
      <i class="bi bi-stars me-2"></i>Sugestões
    </router-link>
    <router-link to="/meu-progresso" v-if="isAuthenticated">
      <i class="bi bi-graph-up me-2"></i>Meu Progresso
    </router-link>
    <router-link to="/upload" v-if="isAuthenticated">
      <i class="bi bi-cloud-upload me-2"></i>Upload
    </router-link>

    <template v-if="isAdmin">
      <hr />
      <router-link to="/admin">
        <i class="bi bi-speedometer2 me-2"></i>Admin Dashboard
      </router-link>
      <router-link to="/admin/treinos">
        <i class="bi bi-clipboard-data me-2"></i>Gerenciar Treinos
      </router-link>
      <router-link to="/admin/categorias">
        <i class="bi bi-tags me-2"></i>Gerenciar Categorias
      </router-link>
      <router-link to="/admin/usuarios">
        <i class="bi bi-person-gear me-2"></i>Gerenciar Usuários
      </router-link>
    </template>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 200px;
  padding: 1rem;
  background-color: #f0f0f2;
  border-right: 1px solid #ddd;
}
</style>
