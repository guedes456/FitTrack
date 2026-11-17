<script setup>
import { ref, watch } from 'vue'
import { useAuthenticatedAction } from '../../composables/useAuthenticatedAction'
import { runOptimistic } from '../../utils/optimistic'
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

// A cerca (visitante -> login) e o isBusy vêm do useAuthenticatedAction; o
// miolo otimista (apply / request / confirm / undo) vem do runOptimistic. Aqui
// só dizemos O QUE muda em cada passo. O aviso de erro é do interceptor.
const { run: handleClick, isBusy } = useAuthenticatedAction(() =>
  runOptimistic({
    apply() {
      // Guarda o estado anterior e muda a tela na hora; devolve o undo.
      const previous = { liked: liked.value, count: count.value }
      liked.value = !previous.liked
      count.value = previous.count + (previous.liked ? -1 : 1)
      return () => {
        liked.value = previous.liked
        count.value = previous.count
      }
    },
    request: () => toggleLike(props.workoutId),
    confirm(data) {
      // O servidor é a fonte da verdade.
      liked.value = data.liked
      count.value = data.likesCount
      emit('change', { liked: liked.value, likesCount: count.value })
    },
  })
)
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
