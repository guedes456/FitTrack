<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsyncData } from '../composables/useAsyncData'
import { useDebouncedValue } from '../composables/useDebouncedValue'
import { SEARCH } from '../config/constants'
import { search } from '../services/searchService'
import { getProfilePictureUrl } from '../utils/media'
import WorkoutCard from '../components/workout/WorkoutCard.vue'

const route = useRoute()
const router = useRouter()

// O estado inicial vem da URL (?q=). typeof: a query pode ser um array
// (?q=a&q=b) ou nulo; só texto serve.
function queryFromUrl() {
  return typeof route.query.q === 'string' ? route.query.q : ''
}

// typedText = o que o CAMPO mostra (muda a cada tecla).
// term      = a cópia "calma": só muda 400 ms depois da última tecla.
// normalizedTerm = o termo sem espaços nas pontas; é ele que dispara a busca.
const typedText = ref(queryFromUrl())
const term = useDebouncedValue(typedText, SEARCH.DEBOUNCE_MS)
const normalizedTerm = computed(() => term.value.trim())

const isTooShort = computed(() => normalizedTerm.value.length < SEARCH.MIN_LENGTH)

// Termo curto: a resposta "vazia" já vem pronta (Promise.resolve) e NENHUMA
// requisição sai. Termo bom: consulta a API.
const { data: results, isLoading, error } = useAsyncData(
  () =>
    isTooShort.value
      ? Promise.resolve({ query: normalizedTerm.value, treinos: [], users: [] })
      : search(normalizedTerm.value).then((response) => response.data),
  { watch: normalizedTerm }
)

// URL -> campo: a Navbar (ou o botão Voltar) mudou o ?q=. Só mexe no campo se
// o valor for DIFERENTE do termo atual; sem essa checagem, o campo e a URL
// ficariam se corrigindo um ao outro em círculo.
watch(
  () => route.query.q,
  () => {
    const fromUrl = queryFromUrl().trim()
    if (fromUrl !== normalizedTerm.value) {
      typedText.value = fromUrl
    }
  }
)

// Campo -> URL: quando o termo (já calmo) muda, grava na URL com REPLACE, e
// não push: voltar não passa por cada pausa da digitação.
watch(normalizedTerm, (value) => {
  if (queryFromUrl() !== value) {
    router.replace({ name: 'search', query: value ? { q: value } : {} })
  }
})

// Foco dado por CÓDIGO (o atributo autofocus não funciona quando a tela é
// aberta por navegação dentro da SPA).
const searchInput = ref(null)
onMounted(() => searchInput.value?.focus())

const hasResults = computed(
  () => results.value && (results.value.treinos.length > 0 || results.value.users.length > 0)
)
</script>

<template>
  <div class="p-4">
    <h1 class="h3 mb-3 brand-title">Buscar</h1>

    <input
      ref="searchInput"
      v-model="typedText"
      type="search"
      class="form-control mb-3"
      style="max-width: 520px;"
      placeholder="Digite o nome de um treino ou de uma pessoa"
      aria-label="Buscar treinos e pessoas"
    />

    <p v-if="isTooShort" class="text-muted small">
      Digite pelo menos {{ SEARCH.MIN_LENGTH }} letras para buscar.
    </p>

    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <p v-else-if="isLoading" class="text-muted">Buscando...</p>

    <template v-else-if="results">
      <p v-if="!hasResults" class="text-muted">Nada encontrado para “{{ results.query }}”.</p>

      <section v-if="results.users.length > 0" class="mb-4">
        <h2 class="h5">Pessoas</h2>
        <ul class="list-unstyled d-flex flex-wrap gap-3">
          <li v-for="person in results.users" :key="person.id">
            <router-link
              :to="{ name: 'public-profile', params: { username: person.username } }"
              class="d-flex align-items-center gap-2 text-decoration-none"
            >
              <img :src="getProfilePictureUrl(person.profilePicture)" alt="" class="avatar-sm" />
              <span>
                <strong>{{ person.username }}</strong>
                <span v-if="person.fullName" class="text-muted small"> · {{ person.fullName }}</span>
              </span>
            </router-link>
          </li>
        </ul>
      </section>

      <section v-if="results.treinos.length > 0">
        <h2 class="h5">Treinos</h2>
        <div class="workout-grid">
          <WorkoutCard v-for="workout in results.treinos" :key="workout.id" :workout="workout" />
        </div>
      </section>
    </template>
  </div>
</template>
