<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicProfile } from '../../services/userService'
import { getFollowers, getFollowing } from '../../services/followService'
import { getProfilePictureUrl } from '../../utils/media'

// Uma implementação, duas rotas: a definição da rota entrega
// props: { kind: 'followers' } ou { kind: 'following' }.
const props = defineProps({
  kind: { type: String, required: true },
})

const route = useRoute()

const profile = ref(null)
const people = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const displayName = computed(() => profile.value?.fullName || profile.value?.username || '')

async function loadList() {
  isLoading.value = true
  errorMessage.value = ''
  profile.value = null
  people.value = []

  try {
    // Duas chamadas EM SEQUÊNCIA: a rota usa o username (/profile/ana/followers),
    // mas a API de listas usa o ID. Primeiro o perfil devolve o id; depois,
    // com o id, buscamos a lista.
    const profileResponse = await getPublicProfile(route.params.username)
    profile.value = profileResponse.data

    const listResponse = props.kind === 'followers'
      ? await getFollowers(profile.value.id)
      : await getFollowing(profile.value.id)
    people.value = listResponse.data
  } catch (error) {
    // 404 (usuário inexistente) ou falha de rede: mensagem na tela, sem quebrar.
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

// Trocar de aba (followers <-> following) ou de pessoa NÃO recria a tela: o
// Vue Router reaproveita o componente e só muda a prop/o parâmetro. O watch
// observa os dois e recarrega.
watch(() => [props.kind, route.params.username], loadList, { immediate: true })
</script>

<template>
  <div class="p-4" style="max-width: 640px;">
    <router-link :to="{ name: 'public-profile', params: { username: route.params.username } }" class="small text-muted">
      <i class="bi bi-arrow-left me-1"></i>Voltar ao perfil
    </router-link>

    <h1 class="h4 mt-2 mb-3">{{ displayName || route.params.username }}</h1>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <router-link
          :to="{ name: 'followers', params: { username: route.params.username } }"
          class="nav-link"
          :class="{ active: kind === 'followers' }"
        >
          Seguidores<span v-if="profile"> ({{ profile.followersCount }})</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          :to="{ name: 'following', params: { username: route.params.username } }"
          class="nav-link"
          :class="{ active: kind === 'following' }"
        >
          Seguindo<span v-if="profile"> ({{ profile.followingCount }})</span>
        </router-link>
      </li>
    </ul>

    <div v-if="isLoading" class="text-muted">Carregando...</div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>

    <div v-else-if="people.length === 0" class="text-muted">
      <template v-if="kind === 'followers'">{{ displayName }} ainda não tem seguidores.</template>
      <template v-else>{{ displayName }} ainda não segue ninguém.</template>
    </div>

    <ul v-else class="person-list">
      <li v-for="person in people" :key="person.id" class="person-item">
        <img :src="getProfilePictureUrl(person.profilePicture)" alt="" class="person-avatar" />
        <div class="person-info">
          <router-link :to="{ name: 'public-profile', params: { username: person.username } }" class="person-name">
            {{ person.fullName || person.username }}
          </router-link>
          <div class="text-muted small">@{{ person.username }}</div>
          <div v-if="person.bio" class="small person-bio">{{ person.bio }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>
