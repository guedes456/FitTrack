<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { toggleLike } from '../../services/likeService'
import { formatCount } from '../../utils/format'

const props = defineProps({
  workoutId: { type: [Number, String], required: true },
  initialLiked: { type: Boolean, default: false },
  initialCount: { type: Number, default: 0 },
})

const emit = defineEmits(['change'])

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

const liked = ref(props.initialLiked)
const count = ref(props.initialCount)
// isBusy: há uma requisição em andamento. Enquanto true, novos cliques são
// ignorados — evita enfileirar toggles e, com a interface já atualizada, o
// usuário perder a conta de em que estado está.
const isBusy = ref(false)
const errorMessage = ref('')

// Se a tela reaproveita o componente para outro treino, volta ao estado dele.
watch(
  () => [props.workoutId, props.initialLiked, props.initialCount],
  () => {
    liked.value = props.initialLiked
    count.value = props.initialCount
    errorMessage.value = ''
  }
)

async function handleClick() {
  // Visitante: não tenta chamar a API (daria 401); vai ao login e, depois de
  // entrar, volta para esta mesma tela.
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (isBusy.value) return

  // ATUALIZAÇÃO OTIMISTA, em três passos:
  // 1) guardar o estado anterior;
  const previous = { liked: liked.value, count: count.value }

  // 2) mudar a interface NA HORA, sem esperar a API (o coração reage mesmo
  //    com internet lenta);
  liked.value = !previous.liked
  count.value = previous.count + (previous.liked ? -1 : 1)
  isBusy.value = true
  errorMessage.value = ''

  try {
    const response = await toggleLike(props.workoutId)
    // 3) confirmar: o servidor é a fonte da verdade, então a tela adota o
    //    valor que ele devolveu (corrige, por exemplo, curtidas de outras
    //    pessoas feitas nesse meio tempo).
    liked.value = response.data.liked
    count.value = response.data.likesCount
    emit('change', { liked: liked.value, likesCount: count.value })
  } catch (error) {
    // 3') ou desfazer (rollback): a API recusou ou não respondeu, então a
    //    tela volta exatamente ao que era e avisa o usuário.
    liked.value = previous.liked
    count.value = previous.count
    errorMessage.value = error.message || 'Não foi possível registrar sua curtida.'
  } finally {
    isBusy.value = false
  }
}
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
    <p v-if="errorMessage" class="like-error" role="alert">{{ errorMessage }}</p>
  </div>
</template>
