<script setup>
// Layout do painel: título, as quatro abas e, embaixo, a tela da aba atual
// (<router-view />, aninhado: as telas são rotas FILHAS de /admin). As abas
// apontam para a rota pelo NOME, não pelo caminho: se o caminho mudar, o
// link continua certo.
const tabs = [
  { name: 'admin-dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { name: 'admin-reports', label: 'Denúncias', icon: 'bi-flag' },
  { name: 'admin-users', label: 'Usuários', icon: 'bi-person-gear' },
  { name: 'admin-treinos', label: 'Treinos', icon: 'bi-clipboard-data' },
]
</script>

<template>
  <div class="p-4">
    <h1 class="h3 brand-title mb-3">Administração</h1>

    <nav aria-label="Seções da administração">
      <ul class="nav nav-pills mb-4">
        <li v-for="tab in tabs" :key="tab.name" class="nav-item">
          <router-link :to="{ name: tab.name }" class="nav-link" active-class="active">
            <i class="bi me-1" :class="tab.icon"></i>{{ tab.label }}
          </router-link>
        </li>
      </ul>
    </nav>

    <router-view />
  </div>
</template>
