<script setup>
import { useAuthenticatedAction } from '../../composables/useAuthenticatedAction'
import { runOptimistic } from '../../utils/optimistic'
import { toggleFollow } from '../../services/followService'

const props = defineProps({
  userId: { type: [Number, String], required: true },
})

// defineModel: o botão NÃO guarda uma cópia própria do estado; ele edita os
// valores do PAI, via v-model. Aqui isso importa porque duas coisas na tela
// precisam mudar juntas — o botão ("Seguir"/"Seguindo") e o número de
// seguidores no cartão do perfil, que é de outro componente.
const following = defineModel('following', { type: Boolean, default: false })
const followersCount = defineModel('followersCount', { type: Number, default: 0 })

const { run: handleClick, isBusy } = useAuthenticatedAction(() =>
  runOptimistic({
    apply() {
      const previous = { following: following.value, followersCount: followersCount.value }
      // PEGADINHA do defineModel: atribuir `following.value = x` só EMITE um
      // evento para o pai; ler `following.value` logo depois devolveria o
      // valor ANTIGO. Por isso o novo estado vai numa variável LOCAL.
      const nowFollowing = !previous.following
      following.value = nowFollowing
      followersCount.value = Math.max(0, previous.followersCount + (nowFollowing ? 1 : -1))
      return () => {
        following.value = previous.following
        followersCount.value = previous.followersCount
      }
    },
    request: () => toggleFollow(props.userId),
    confirm(data) {
      following.value = data.isFollowing
      followersCount.value = data.followersCount
    },
  })
)
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
