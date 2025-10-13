import { usePageStatusStore } from '@/stores/pageStatusStores'
import { onMounted, onUnmounted } from 'vue'

export function useGlobalShortcutKey() {
  const pageStatusStore = usePageStatusStore()

  function handleKeyDown(event: KeyboardEvent) {
    const activeElement = document.activeElement
    const isInputFocused =
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      (activeElement instanceof HTMLElement && activeElement.isContentEditable)

    if (isInputFocused) return

    if (event.code === 'Space') {
      const audioEl = document.querySelector('audio')
      if (!audioEl || !audioEl.duration) return
      event.preventDefault()
      if (audioEl.paused) {
        audioEl.play()
      } else {
        audioEl.pause()
      }
    }

    // 处理 Ctrl+B 组合键切换状态
    if (event.ctrlKey && event.code === 'KeyB') {
      event.preventDefault()
      pageStatusStore.toggleNav()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
