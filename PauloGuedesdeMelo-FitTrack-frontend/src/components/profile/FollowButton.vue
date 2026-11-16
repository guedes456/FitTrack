<script setup>
import { useAuthenticatedAction } from '../../composables/useAuthenticatedAction'
import { toggleFollow } from '../../services/followService'

const props = defineProps({
  userId: { type: [Number, String], required: true },
})

// defineModel: o botão NÃO guarda uma cópia própria do estado; ele edita os
// valores do PAI, via v-model. Aqui isso importa porque duas coisas na tela
// precisam mudar juntas — o botão ("Seguir"/"Seguindo") e o número de
// seguidores no cartão do perfil, que é de outro componente. O LikeButton
// continua com estado próprio: lá o contador pertence só ao botão.
const following = defineModel('following', { type: Boolean, default: false })
const followersCount = defineModel('followersCount', { type: Number, default: 0 })

// Cerca (visitante -> login) e isBusy vêm do composable; o erro é avisado
// pelo toast do interceptor.
const { run: handleClick, isBusy } = useAuthenticatedAction(async () => {
  // ATUALIZAÇÃO OTIMISTA, em três passos.
  // 1) guardar o estado anterior;
  const previous = { following: following.value, followersCount: followersCount.value }

  // 2) calcular o novo estado numa variável LOCAL e aplicar na hora. Com
  //    defineModel, atribuir `following.value = x` apenas EMITE um evento
  //    para o pai; ler `following.value` logo após atribuir devolveria o
  //    valor ANTIGO — por isso a conta usa `nowFollowing`.
  const nowFollowing = !previous.following
  following.value = nowFollowing
  followersCount.value = Math.max(0, previous.followersCount + (nowFollowing ? 1 : -1))

  try {
    const response = await toggleFollow(props.userId)
    // 3) confirmar: o servidor é a fonte da verdade.
    following.value = response.data.isFollowing
    followersCount.value = response.data.followersCount
  } catch {
    // 3') ou desfazer: volta exatamente ao que era.
    following.value = previous.following
    followersCount.value = previous.followersCount
  }
})
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
  </div>
</template>
