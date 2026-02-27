import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'info'

type ToastState = {
  type: ToastType
  text: string
} | null

const toast = ref<ToastState>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function show(type: ToastType, text: string, duration = 4000) {
    toast.value = { type, text }

    if (toastTimer) {
      clearTimeout(toastTimer)
    }

    toastTimer = setTimeout(() => {
      toast.value = null
      toastTimer = null
    }, duration)
  }

  function clear() {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    toast.value = null
  }

  return { toast, show, clear }
}
