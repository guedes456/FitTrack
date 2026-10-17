<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { getComments, addComment } from '../../services/commentService'
import { getProfilePictureUrl } from '../../utils/media'
import { formatDateTime } from '../../utils/format'

const COMMENT_MAX = 500

const props = defineProps({
  workoutId: { type: [Number, String], required: true },
})

const emit = defineEmits(['added'])

const route = useRoute()
const { isAuthenticated } = useAuth()

const comments = ref([])
const isLoading = ref(true)
const loadError = ref('')

const text = ref('')
const formError = ref('')
const isSending = ref(false)

async function loadComments(workoutId) {
  isLoading.value = true
  loadError.value = ''
  try {
    const response = await getComments(workoutId)
    comments.value = response.data
  } catch (error) {
    loadError.value = error.message
  } finally {
    isLoading.value = false
  }
}

watch(() => props.workoutId, (id) => loadComments(id), { immediate: true })

function validate() {
  const trimmed = text.value.trim()
  if (!trimmed) {
    formError.value = 'O comentário não pode ficar vazio.'
    return false
  }
  if (trimmed.length > COMMENT_MAX) {
    formError.value = `O comentário deve ter no máximo ${COMMENT_MAX} caracteres.`
    return false
  }
  formError.value = ''
  return true
}

async function handleSubmit() {
  // Validação do cliente: se falhar, nenhuma requisição sai.
  if (!validate() || isSending.value) return

  isSending.value = true
  try {
    const response = await addComment(props.workoutId, text.value.trim())
    // O novo comentário entra no TOPO da lista que já está na tela, sem
    // recarregar tudo (a API já devolve o autor junto).
    comments.value.unshift(response.data)
    text.value = ''
    emit('added', response.data)
  } catch (error) {
    formError.value = error.message
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <section class="comments mt-4">
    <h2 class="h5 mb-3">Comentários ({{ comments.length }})</h2>

    <form v-if="isAuthenticated" class="mb-4" novalidate @submit.prevent="handleSubmit">
      <textarea
        v-model="text"
        class="form-control"
        :class="{ 'is-invalid': formError }"
        rows="3"
        placeholder="Escreva um comentário..."
        aria-label="Escreva um comentário"
      ></textarea>
      <div class="d-flex justify-content-between align-items-start mt-1">
        <div class="invalid-feedback d-block" v-if="formError">{{ formError }}</div>
        <span v-else></span>
        <small :class="text.length > COMMENT_MAX ? 'text-danger' : 'text-muted'">
          {{ text.length }}/{{ COMMENT_MAX }}
        </small>
      </div>
      <button type="submit" class="btn btn-sm btn-brand mt-2" :disabled="isSending">
        {{ isSending ? 'Enviando...' : 'Comentar' }}
      </button>
    </form>

    <p v-else class="text-muted small mb-4">
      <router-link :to="{ name: 'login', query: { redirect: route.fullPath } }">Entre</router-link>
      para comentar.
    </p>

    <div v-if="isLoading" class="text-muted">Carregando comentários...</div>
    <div v-else-if="loadError" class="alert alert-danger py-2" role="alert">{{ loadError }}</div>
    <div v-else-if="comments.length === 0" class="text-muted">
      Ainda não há comentários. Seja a primeira pessoa a comentar.
    </div>

    <ul v-else class="comment-list">
      <li v-for="comment in comments" :key="comment.id" class="comment-item">
        <img
          :src="getProfilePictureUrl(comment.user?.profilePicture)"
          alt=""
          class="avatar-sm"
        />
        <div class="comment-body">
          <div class="comment-header">
            <router-link
              v-if="comment.user"
              :to="{ name: 'public-profile', params: { username: comment.user.username } }"
              class="comment-author"
            >
              {{ comment.user.username }}
            </router-link>
            <span class="text-muted small">{{ formatDateTime(comment.createdAt) }}</span>
          </div>
          <!-- {{ }} escapa o texto: <b>, <img onerror=...> e qualquer HTML
               aparecem como TEXTO. v-html interpretaria o HTML e permitiria
               injetar scripts na tela de quem lê (XSS). -->
          <p class="comment-text">{{ comment.content }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
