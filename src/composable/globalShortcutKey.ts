import { onMounted, onUnmounted } from 'vue'

export function useGlobalShortcutKey() {
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
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
