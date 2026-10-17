<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useClickOutside } from '../../composables/useClickOutside'

const router = useRouter()
const { isAuthenticated, username, profilePictureUrl, logout } = useAuth()

// O estado do menu é UM booleano controlado por nós (não por CSS :hover nem
// pelo Bootstrap JS): clique no avatar alterna, e os três jeitos de fechar
// (clicar fora, escolher um item, apertar Esc) só colocam o booleano em false.
const menuOpen = ref(false)
const menuRoot = ref(null)

function closeMenu() {
  menuOpen.value = false
}

useClickOutside(menuRoot, closeMenu)

function onKeydown(event) {
  if (event.key === 'Escape') closeMenu()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

async function handleLogout() {
  closeMenu()
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

        <!-- O wrapper (ref) contém o botão E o menu: clicar no botão conta
             como "dentro", então o useClickOutside não fecha o menu no mesmo
             clique que o abriu. -->
        <div ref="menuRoot" class="avatar-menu">
          <button
            type="button"
            class="avatar-menu-toggle"
            aria-haspopup="menu"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <img :src="profilePictureUrl" alt="" class="avatar-sm" />
            <span class="avatar-menu-name">{{ username }}</span>
            <i class="bi bi-chevron-down small"></i>
          </button>

          <div v-if="menuOpen" class="avatar-menu-list" role="menu">
            <router-link to="/perfil" role="menuitem" @click="closeMenu">
              <i class="bi bi-pencil-square me-2"></i>Editar Perfil
            </router-link>
            <router-link :to="{ name: 'public-profile', params: { username } }" role="menuitem" @click="closeMenu">
              <i class="bi bi-person-circle me-2"></i>Ver Perfil
            </router-link>
            <router-link to="/meus-treinos" role="menuitem" @click="closeMenu">
              <i class="bi bi-grid me-2"></i>Meus Itens
            </router-link>
            <router-link to="/curtidos" role="menuitem" @click="closeMenu">
              <i class="bi bi-heart me-2"></i>Curtidos
            </router-link>
            <hr class="my-1" />
            <button type="button" role="menuitem" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i>Sair
            </button>
          </div>
        </div>
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

.avatar-menu {
  position: relative;
}

.avatar-menu-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.5rem;
  background: transparent;
  border: 1px solid #555;
  border-radius: 999px;
  color: #ddd;
  cursor: pointer;
}
.avatar-menu-toggle:hover {
  color: #fff;
  border-color: #888;
}

.avatar-menu-name {
  font-size: 0.9rem;
}

/* right: 0 alinha a borda direita do menu com a do botão, para ele abrir
   "para a esquerda" e nunca vazar para fora da tela. */
.avatar-menu-list {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 1040;
  min-width: 190px;
  padding: 0.35rem 0;
  background: #fff;
  border: 1px solid #e5e5ea;
  border-radius: 0.5rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.avatar-menu-list a,
.avatar-menu-list button {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: 0;
  color: #222;
  text-align: left;
  text-decoration: none;
  font-size: 0.95rem;
  cursor: pointer;
}
.avatar-menu-list a:hover,
.avatar-menu-list button:hover {
  background: #f1f1f4;
}
</style>
