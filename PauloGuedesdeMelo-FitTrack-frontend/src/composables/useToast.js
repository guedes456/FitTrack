import { ref } from 'vue'
import { TOAST_DURATION } from '../config/constants'

// SINGLETON: a lista fica FORA da função useToast(). Assim, todo mundo que
// chama useToast() — o ToastContainer, o interceptor do Axios (que nem é um
// componente), qualquer tela — enxerga a MESMA lista. Se ela ficasse dentro
// da função, cada chamada criaria uma lista nova e o container nunca
// veria os toasts criados por outros.
//
// Diferente de uma store do Pinia, isso funciona em qualquer lugar sem
// instalar o Pinia antes (o interceptor roda fora do ciclo de vida dos
// componentes) e não adiciona nada ao que o Pinia já guarda de verdade
// (sessão, usuário). Toast é estado efêmero de interface, não dado do app.
const toasts = ref([])
let nextId = 1

function remove(id) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function show(message, type = 'info', duration) {
  const id = nextId++
  const ms = duration ?? TOAST_DURATION[type.toUpperCase()] ?? TOAST_DURATION.INFO
  toasts.value.push({ id, message, type })
  setTimeout(() => remove(id), ms)
  return id
}

export function useToast() {
  return {
    toasts,
    remove,
    success: (message, duration) => show(message, 'success', duration),
    error: (message, duration) => show(message, 'error', duration),
    info: (message, duration) => show(message, 'info', duration),
  }
}
