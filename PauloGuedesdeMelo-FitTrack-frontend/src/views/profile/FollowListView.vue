<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '../../composables/useAsyncData'
import { getPublicProfile } from '../../services/userService'
import { getFollowers, getFollowing } from '../../services/followService'
import { getProfilePictureUrl } from '../../utils/media'

// Uma implementação, duas rotas: a definição da rota entrega
// props: { kind: 'followers' } ou { kind: 'following' }.
const props = defineProps({
  kind: { type: String, required: true },
})

const route = useRoute()

// Duas chamadas EM SEQUÊNCIA: a rota usa o username (/profile/ana/followers),
// mas a API de listas usa o ID. Primeiro o perfil devolve o id; depois, com
// o id, buscamos a lista. Trocar de aba ou de pessoa NÃO recria a tela, então
// o watch observa as duas coisas.
const { data, isLoading, error } = useAsyncData(
  async () => {
    const profileResponse = await getPublicProfile(route.params.username)
    const profile = profileResponse.data
    const listResponse = props.kind === 'followers'
      ? await getFollowers(profile.id)
      : await getFollowing(profile.id)
    return { profile, people: listResponse.data }
  },
  { watch: () => [props.kind, route.params.username] }
)

const profile = computed(() => data.value?.profile ?? null)
const people = computed(() => data.value?.people ?? [])
const displayName = computed(() => profile.value?.fullName || profile.value?.username || '')
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

    <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

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
