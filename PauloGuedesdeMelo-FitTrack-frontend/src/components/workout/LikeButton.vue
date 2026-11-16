<script setup>
import { ref, watch } from 'vue'
import { useAuthenticatedAction } from '../../composables/useAuthenticatedAction'
import { toggleLike } from '../../services/likeService'
import { formatCount } from '../../utils/format'

const props = defineProps({
  workoutId: { type: [Number, String], required: true },
  initialLiked: { type: Boolean, default: false },
  initialCount: { type: Number, default: 0 },
})

const emit = defineEmits(['change'])

const liked = ref(props.initialLiked)
const count = ref(props.initialCount)

// Se a tela reaproveita o componente para outro treino, volta ao estado dele.
watch(
  () => [props.workoutId, props.initialLiked, props.initialCount],
  () => {
    liked.value = props.initialLiked
    count.value = props.initialCount
  }
)

// useAuthenticatedAction cuida da cerca (visitante vai ao login) e do isBusy
// (clique durante uma requisição é ignorado: três cliques rápidos = uma
// requisição). Quem avisa o erro ao usuário é o interceptor do Axios (toast).
const { run: handleClick, isBusy } = useAuthenticatedAction(async () => {
  // ATUALIZAÇÃO OTIMISTA, em três passos:
  // 1) guardar o estado anterior;
  const previous = { liked: liked.value, count: count.value }

  // 2) mudar a interface NA HORA, sem esperar a API;
  liked.value = !previous.liked
  count.value = previous.count + (previous.liked ? -1 : 1)

  try {
    const response = await toggleLike(props.workoutId)
    // 3) confirmar: o servidor é a fonte da verdade.
    liked.value = response.data.liked
    count.value = response.data.likesCount
    emit('change', { liked: liked.value, likesCount: count.value })
  } catch {
    // 3') ou desfazer (rollback): a tela volta exatamente ao que era. O aviso
    //     ao usuário (toast) já foi dado pelo interceptor.
    liked.value = previous.liked
    count.value = previous.count
  }
})
</script>

<template>
  <div class="like-wrapper">
    <button
      type="button"
      class="like-button"
      :class="{ 'is-liked': liked }"
      :aria-pressed="liked"
      :aria-busy="isBusy"
      :aria-label="liked ? 'Descurtir' : 'Curtir'"
      :disabled="isBusy"
      @click="handleClick"
    >
      <i class="bi" :class="liked ? 'bi-heart-fill' : 'bi-heart'"></i>
      <span class="like-count">{{ formatCount(count) }}</span>
    </button>
  </div>
</template>
