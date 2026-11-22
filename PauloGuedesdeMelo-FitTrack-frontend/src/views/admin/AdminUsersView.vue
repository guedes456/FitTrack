<script setup>
import { reactive, ref } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useDebouncedValue } from '../../composables/useDebouncedValue'
import { usePaginatedList } from '../../composables/usePaginatedList'
import { useToast } from '../../composables/useToast'
import { SEARCH } from '../../config/constants'
import { getAdminUsers, setUserBlocked } from '../../services/adminService'
import { getProfilePictureUrl } from '../../utils/media'
import BaseButton from '../../components/base/BaseButton.vue'
import ConfirmModal from '../../components/base/ConfirmModal.vue'

const toast = useToast()
const { user: currentUser } = useAuth()

// typedText muda a cada tecla; term só muda depois da pausa (debounce). A
// lista recomeça quando `term` muda, NÃO quando typedText muda.
const typedText = ref('')
const term = useDebouncedValue(typedText, SEARCH.DEBOUNCE_MS)

const { items, hasMore, isLoading, error, loadMore } = usePaginatedList(
  (page, limit) => getAdminUsers(term.value.trim(), page, limit),
  { watch: term }
)

const busyIds = reactive(new Set())
// Interruptor E dado do modal: null = fechado; um usuário = aberto para ele.
const userToBlock = ref(null)

async function changeBlocked(user, isBlocked) {
  if (busyIds.has(user.id)) return
  busyIds.add(user.id)

  try {
    const response = await setUserBlocked(user.id, isBlocked)
    // Só DEPOIS da resposta, e com o valor que a API devolveu.
    user.isBlocked = response.data.isBlocked
    toast.success(response.message)
    // O modal só fecha no SUCESSO: se a API recusar, ele continua aberto.
    userToBlock.value = null
  } catch {
    // O toast de erro é do interceptor.
  } finally {
    busyIds.delete(user.id)
  }
}
</script>

<template>
  <section aria-labelledby="users-title">
    <h2 id="users-title" class="h5 mb-3">Usuários</h2>

    <!-- O campo de busca fica FORA do bloco de carregamento: se saísse da
         tela a cada busca, perderia o foco no meio da digitação. -->
    <div class="mb-3">
      <label for="user-search" class="form-label visually-hidden">Buscar usuários</label>
      <input
        id="user-search"
        v-model="typedText"
        type="search"
        class="form-control"
        placeholder="Buscar por usuário, e-mail ou nome"
        autocomplete="off"
      />
    </div>

    <p v-if="isLoading && items.length === 0" class="text-muted">Carregando usuários...</p>

    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <p v-else-if="items.length === 0" class="text-muted">Nenhum usuário encontrado.</p>

    <template v-else>
      <ul class="list-unstyled mb-3">
        <li v-for="user in items" :key="user.id" class="user-row d-flex align-items-center gap-3 p-2 mb-2 rounded">
          <img :src="getProfilePictureUrl(user.profilePicture)" alt="" class="avatar-sm" />

          <div class="flex-grow-1">
            <router-link :to="{ name: 'public-profile', params: { username: user.username } }" class="fw-semibold">
              @{{ user.username }}
            </router-link>
            <span v-if="user.isAdmin" class="badge text-bg-primary ms-2">Admin</span>
            <span v-if="user.isBlocked" class="badge text-bg-danger ms-1">Bloqueado</span>
            <div class="text-muted small">{{ user.email }}</div>
          </div>

          <!-- A ação certa para cada linha. -->
          <span v-if="user.id === currentUser?.id" class="text-muted small">Você</span>
          <span v-else-if="user.isAdmin" class="text-muted small">Administrador</span>
          <button
            v-else-if="user.isBlocked"
            type="button"
            class="btn btn-sm btn-outline-secondary"
            :disabled="busyIds.has(user.id)"
            @click="changeBlocked(user, false)"
          >
            {{ busyIds.has(user.id) ? 'Salvando...' : 'Desbloquear' }}
          </button>
          <button v-else type="button" class="btn btn-sm btn-outline-danger" @click="userToBlock = user">
            Bloquear
          </button>
        </li>
      </ul>

      <div v-if="hasMore" class="text-center">
        <BaseButton type="button" variant="outline" :block="false" :loading="isLoading" loading-text="Carregando..." @click="loadMore">
          Carregar mais usuários
        </BaseButton>
      </div>
    </template>

    <ConfirmModal
      v-if="userToBlock"
      title="Bloquear usuário"
      :message="`Bloquear @${userToBlock.username}? A pessoa será desconectada na próxima ação e não conseguirá entrar até ser desbloqueada. Os treinos dela continuam visíveis.`"
      confirm-label="Bloquear"
      :busy="busyIds.has(userToBlock.id)"
      @confirm="changeBlocked(userToBlock, true)"
      @close="userToBlock = null"
    />
  </section>
</template>

<style scoped>
.user-row {
  background: #fff;
  border: 1px solid #e5e5e5;
}
</style>
