import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

interface Toast {
  message: string
  type: ToastType
  duration: number
}

export const useToastStore = defineStore('toast', () => {
  const currentToast = ref<Toast | null>(null)
  const visible = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  const showToast = (message: string, type: ToastType = 'info', duration: number = 4000) => {
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }

    currentToast.value = {
      message,
      type,
      duration,
    }
    visible.value = true

    // 设置自动关闭
    if (duration > 0) {
      timer = setTimeout(() => {
        hideToast()
      }, duration)
    }
  }

  const hideToast = () => {
    visible.value = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    // 延迟清除数据，等待动画完成
    setTimeout(() => {
      currentToast.value = null
    }, 300)
  }

  return {
    currentToast,
    visible,
    showToast,
    hideToast,
  }
})
