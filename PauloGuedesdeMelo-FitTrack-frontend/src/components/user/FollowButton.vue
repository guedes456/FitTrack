<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { toggleFollow } from '../../services/followService'

const props = defineProps({
  userId: { type: [Number, String], required: true },
})

// Dois v-model: o PAI (o perfil) é dono desses valores, e o botão os altera
// direto. Assim o contador "seguidores" do cartão do perfil muda junto com o
// botão, sem evento nem estado duplicado. (No LikeButton da Atividade 10, o
// botão tinha estado próprio, iniciado por props, porque ninguém mais na
// tela precisava enxergar aquele valor.)
const following = defineModel('following', { type: Boolean, default: false })
const followersCount = defineModel('followersCount', { type: Number, default: 0 })

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

const isBusy = ref(false)
const errorMessage = ref('')

async function handleClick() {
  // Visitante: não chama a API (daria 401); vai ao login e volta ao perfil.
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (isBusy.value) return

  // ATUALIZAÇÃO OTIMISTA, em três passos:
  // 1) guardar o estado anterior;
  const previous = { following: following.value, count: followersCount.value }

  // 2) mudar a interface NA HORA. O novo estado vai numa variável local:
  //    com defineModel, `following.value` logo depois de atribuído ainda
  //    devolve o valor ANTIGO (o valor novo só chega pelo pai no próximo
  //    ciclo de renderização). Ler `following.value` aqui para decidir o
  //    contador somaria para o lado errado.
  const nowFollowing = !previous.following
  following.value = nowFollowing
  followersCount.value = Math.max(0, previous.count + (nowFollowing ? 1 : -1))
  isBusy.value = true
  errorMessage.value = ''

  try {
    const response = await toggleFollow(props.userId)
    // 3) confirmar: o servidor é a fonte da verdade.
    following.value = response.data.isFollowing
    followersCount.value = response.data.followersCount
  } catch (error) {
    // 3') ou desfazer (rollback) e avisar.
    following.value = previous.following
    followersCount.value = previous.count
    errorMessage.value = error.message || 'Não foi possível atualizar. Tente novamente.'
  } finally {
    isBusy.value = false
  }
}
</script>

<template>
  <div class="follow-wrapper">
    <button
      type="button"
      class="btn btn-sm"
      :class="following ? 'btn-outline-secondary' : 'btn-brand'"
      :aria-pressed="following"
      :aria-busy="isBusy"
      :disabled="isBusy"
      @click="handleClick"
    >
      <i class="bi me-1" :class="following ? 'bi-person-check' : 'bi-person-plus'"></i>{{ following ? 'Seguindo' : 'Seguir' }}
    </button>
    <p v-if="errorMessage" class="follow-error" role="alert">{{ errorMessage }}</p>
  </div>
</template>
