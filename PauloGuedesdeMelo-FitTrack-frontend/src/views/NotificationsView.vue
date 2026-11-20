<script setup>
import { reactive } from 'vue'
import { usePaginatedList } from '../composables/usePaginatedList'
import { useNotificationsStore } from '../stores/notifications'
import { runOptimistic } from '../utils/optimistic'
import { NOTIFICATION_TEXT } from '../config/constants'
import { getNotifications, markNotificationAsRead } from '../services/notificationService'
import { getProfilePictureUrl } from '../utils/media'
import { formatDateTime } from '../utils/format'
import BaseButton from '../components/base/BaseButton.vue'

const notifications = useNotificationsStore()

// "Atualizar" (reload) recomeça a lista; "Carregar mais" (loadMore) traz a
// próxima página. LACUNA CONHECIDA (decisão de escopo): a LISTA não se atualiza
// sozinha; só o número do sino (via polling). Quem quer ver o aviso novo na
// lista clica em "Atualizar".
const { items, hasMore, isLoading, error, loadMore, reload } = usePaginatedList(getNotifications)

// "Cerca" POR LINHA: ids com uma requisição em andamento. Dois cliques
// seguidos na mesma notificação geram UMA requisição; as outras linhas
// continuam livres.
const busyIds = reactive(new Set())

// QUARTO caso do runOptimistic (curtir, seguir, caixa da rotina e agora a
// notificação). O que muda: apply marca a linha E mexe no sino; request é o
// PATCH; confirm acerta a linha e entrega à store o número que a API calculou.
// O que NÃO muda: apply -> request -> confirm | undo (utils/optimistic.js não
// foi alterado).
function markAsRead(notification) {
  if (notification.isRead || busyIds.has(notification.id)) return Promise.resolve()
  busyIds.add(notification.id)

  return runOptimistic({
    apply() {
      notification.isRead = true
      // O sino desce 1 (e nunca abaixo de zero).
      notifications.setUnreadCount(Math.max(0, notifications.unreadCount - 1))
      // O UNDO É RELATIVO: soma 1 ao número ATUAL, em vez de voltar ao "número
      // que eu vi". Se duas linhas falharem juntas, cada undo soma 1 e o sino
      // volta ao número do começo; se o undo gravasse o número antigo, o
      // segundo sobrescreveria o primeiro (e um refresh no meio da história
      // também seria desfeito sem querer).
      return () => {
        notification.isRead = false
        notifications.setUnreadCount(notifications.unreadCount + 1)
      }
    },
    request: () => markNotificationAsRead(notification.id),
    confirm(data) {
      notification.isRead = data.isRead
      // O servidor é a fonte da verdade: o sino passa a ser o número que ele
      // calculou DEPOIS da escrita.
      notifications.setUnreadCount(data.unreadCount)
    },
  }).finally(() => busyIds.delete(notification.id))
}

// Para onde o clique no texto leva: seguir -> perfil de quem seguiu; curtir e
// comentar -> o treino. (Se o treino sumiu, cai no perfil.)
function targetFor(notification) {
  if (notification.type === 'follow' || !notification.workoutId) {
    return { name: 'public-profile', params: { username: notification.actor.username } }
  }
  return { name: 'treino-detail', params: { id: notification.workoutId } }
}
</script>

<template>
  <div class="p-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h3 mb-0 brand-title">Notificações</h1>
      <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="isLoading" @click="reload">
        <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
      </button>
    </div>

    <!-- Ordem: carregando -> erro -> conteúdo. -->
    <p v-if="isLoading && items.length === 0" class="text-muted">Carregando notificações...</p>

    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <p v-else-if="items.length === 0" class="text-muted">
      Você ainda não tem notificações. Quando alguém curtir ou comentar um treino seu, ou
      começar a seguir você, o aviso aparece aqui.
    </p>

    <template v-else>
      <ul class="list-unstyled mb-3">
        <li
          v-for="notification in items"
          :key="notification.id"
          class="notification-row d-flex align-items-center gap-3 p-2 mb-2 rounded"
          :class="{ unread: !notification.isRead }"
        >
          <img :src="getProfilePictureUrl(notification.actor.profilePicture)" alt="" class="avatar-sm" />

          <div class="flex-grow-1">
            <!-- O clique no texto marca como lida E navega (o router-link
                 navega; o @click dispara a marcação em segundo plano). -->
            <router-link
              :to="targetFor(notification)"
              class="notification-text text-decoration-none"
              @click="markAsRead(notification)"
            >
              <strong>@{{ notification.actor.username }}</strong>
              {{ NOTIFICATION_TEXT[notification.type] }}
              <template v-if="notification.workout">“{{ notification.workout.title }}”</template>
            </router-link>
            <div class="text-muted small">{{ formatDateTime(notification.createdAt) }}</div>
          </div>

          <button
            v-if="!notification.isRead"
            type="button"
            class="btn btn-sm btn-outline-secondary"
            :disabled="busyIds.has(notification.id)"
            @click="markAsRead(notification)"
          >
            Marcar como lida
          </button>
        </li>
      </ul>

      <div v-if="hasMore" class="text-center">
        <BaseButton type="button" variant="outline" :block="false" :loading="isLoading" loading-text="Carregando..." @click="loadMore">
          Carregar mais notificações
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.notification-row {
  background: #fff;
  border: 1px solid #e5e5e5;
}
/* Não lidas em destaque: fundo e negrito. */
.notification-row.unread {
  background: #fff3ec;
  border-color: #ffb995;
  font-weight: 600;
}
.notification-text {
  color: inherit;
}
</style>
