<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicProfile } from '../../services/userService'
import { getFollowers, getFollowing } from '../../services/followService'
import { getProfilePictureUrl } from '../../utils/media'

// UMA tela para DUAS rotas (/profile/:username/seguidores e
// /profile/:username/seguindo). Quem diferencia é a prop `kind`, entregue
// pela definição da rota: props: { kind: 'followers' } ou 'following'.
const props = defineProps({
  kind: { type: String, required: true, validator: (v) => ['followers', 'following'].includes(v) },
})

const route = useRoute()

const profile = ref(null)
const people = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// Evita que uma resposta antiga (de uma aba/perfil já abandonado) sobrescreva
// a atual quando o usuário troca de aba rápido.
let requestCounter = 0

async function loadList() {
  const myRequest = ++requestCounter
  isLoading.value = true
  errorMessage.value = ''
  profile.value = null
  people.value = []

  try {
    // Duas chamadas EM SEQUÊNCIA: a rota usa o username, mas a API de listas
    // usa o id — o perfil vem primeiro só para descobrir o id.
    const profileResponse = await getPublicProfile(route.params.username)
    if (myRequest !== requestCounter) return
    profile.value = profileResponse.data

    const listResponse = props.kind === 'followers'
      ? await getFollowers(profile.value.id)
      : await getFollowing(profile.value.id)
    if (myRequest !== requestCounter) return
    people.value = listResponse.data
  } catch (error) {
    if (myRequest !== requestCounter) return
    errorMessage.value = error.message
  } finally {
    if (myRequest === requestCounter) isLoading.value = false
  }
}

// Reage às duas mudanças possíveis: trocar de aba (kind) e trocar de pessoa
// (username) — a rota é a mesma, então o componente é reaproveitado.
watch(() => [props.kind, route.params.username], loadList, { immediate: true })
</script>

<template>
  <div class="p-4">
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      <p class="mb-2">{{ errorMessage }}</p>
      <router-link to="/feed" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i>Voltar ao Feed
      </router-link>
    </div>

    <template v-else>
      <router-link
        :to="{ name: 'public-profile', params: { username: route.params.username } }"
        class="d-inline-block mb-3 text-decoration-none"
      >
        <i class="bi bi-arrow-left me-1"></i>Voltar ao perfil de @{{ route.params.username }}
      </router-link>

      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <router-link
            :to="{ name: 'profile-followers', params: { username: route.params.username } }"
            class="nav-link"
            :class="{ active: kind === 'followers' }"
          >
            Seguidores<span v-if="profile"> ({{ profile.followersCount }})</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            :to="{ name: 'profile-following', params: { username: route.params.username } }"
            class="nav-link"
            :class="{ active: kind === 'following' }"
          >
            Seguindo<span v-if="profile"> ({{ profile.followingCount }})</span>
          </router-link>
        </li>
      </ul>

      <div v-if="isLoading" class="text-muted">Carregando...</div>

      <div v-else-if="people.length === 0" class="text-muted">
        <template v-if="kind === 'followers'">
          {{ profile.fullName || profile.username }} ainda não tem seguidores.
        </template>
        <template v-else>
          {{ profile.fullName || profile.username }} ainda não segue ninguém.
        </template>
      </div>

      <ul v-else class="follow-list">
        <li v-for="person in people" :key="person.id" class="follow-list-item">
          <router-link
            :to="{ name: 'public-profile', params: { username: person.username } }"
            class="follow-list-link"
          >
            <img :src="getProfilePictureUrl(person.profilePicture)" alt="" class="avatar-sm" />
            <span>
              <strong>{{ person.fullName || person.username }}</strong>
              <span class="text-muted d-block small">@{{ person.username }}</span>
            </span>
          </router-link>
        </li>
      </ul>
    </template>
  </div>
</template>
