<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { toggleFollow } from '../../services/followService'

const props = defineProps({
  userId: { type: [Number, String], required: true },
})

// defineModel: o botão NÃO guarda uma cópia própria do estado; ele edita os
// valores do PAI, via v-model. Aqui isso importa porque duas coisas na tela
// precisam mudar juntas — o botão ("Seguir"/"Seguindo") e o número de
// seguidores no cartão do perfil, que é de outro componente. Com o padrão da
// Atividade 10 (valor inicial -> estado próprio, como no LikeButton), cada
// um teria sua cópia e o contador do cartão ficaria parado. O LikeButton
// continua certo como está: lá o contador pertence só ao botão.
const following = defineModel('following', { type: Boolean, default: false })
const followersCount = defineModel('followersCount', { type: Number, default: 0 })

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

const isBusy = ref(false)
const errorMessage = ref('')

async function handleClick() {
  // Visitante: vai ao login e volta para este perfil depois de entrar.
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (isBusy.value) return

  // ATUALIZAÇÃO OTIMISTA, em três passos.
  // 1) guardar o estado anterior;
  const previous = { following: following.value, followersCount: followersCount.value }

  // 2) calcular o novo estado numa variável LOCAL e aplicar na hora. Com
  //    defineModel, atribuir `following.value = x` apenas EMITE um evento
  //    para o pai; o valor lido volta a mudar só depois que o pai atualizar
  //    e a prop chegar de novo (no próximo ciclo de renderização). Ler
  //    `following.value` logo após atribuir devolveria o valor ANTIGO — por
  //    isso a conta usa `nowFollowing`, nunca `following.value` já atribuído.
  const nowFollowing = !previous.following
  following.value = nowFollowing
  followersCount.value = Math.max(0, previous.followersCount + (nowFollowing ? 1 : -1))

  isBusy.value = true
  errorMessage.value = ''

  try {
    const response = await toggleFollow(props.userId)
    // 3) confirmar: o servidor é a fonte da verdade.
    following.value = response.data.isFollowing
    followersCount.value = response.data.followersCount
  } catch (error) {
    // 3') ou desfazer: volta exatamente ao que era e avisa.
    following.value = previous.following
    followersCount.value = previous.followersCount
    errorMessage.value = error.message || 'Não foi possível concluir. Tente novamente.'
  } finally {
    isBusy.value = false
  }
}
</script>

<template>
  <div class="follow-wrapper">
    <button
      type="button"
      class="btn btn-sm follow-button"
      :class="following ? 'btn-outline-secondary is-following' : 'btn-brand'"
      :aria-pressed="following"
      :aria-busy="isBusy"
      :disabled="isBusy"
      @click="handleClick"
    >
      <i class="bi me-1" :class="following ? 'bi-person-check' : 'bi-person-plus'"></i>
      {{ following ? 'Seguindo' : 'Seguir' }}
    </button>
    <p v-if="errorMessage" class="follow-error" role="alert">{{ errorMessage }}</p>
  </div>
</template>
