import { ref, onMounted, onUnmounted } from 'vue'
import { useplaybackQueueStore } from '@/stores/playbackQueueStores'

export function useAudioPlayer() {
  const playbackQueueStores = useplaybackQueueStore()
  const isDragging = ref(false)
  const progressBar = ref<HTMLElement | null>(null)

  const togglePlayPause = () => {
    const audio = document.querySelector('audio') as HTMLAudioElement | null
    if (!audio) return
    if (playbackQueueStores.isPlaying) audio.pause()
    else audio.play().catch(console.error)
  }

  const seekByClick = (event: MouseEvent) => {
    const bar = progressBar.value
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const audio = document.querySelector('audio') as HTMLAudioElement | null
    if (!audio) return
    audio.currentTime = ratio * playbackQueueStores.currentPlayingDuration
  }

  const startDrag = () => {
    isDragging.value = true
    const audio = document.querySelector('audio') as HTMLAudioElement | null
    if (!audio) return

    const onMove = (e: MouseEvent) => {
      const bar = progressBar.value
      if (!bar) return
      const rect = bar.getBoundingClientRect()
      const ratio = Math.min(Math.max(e.clientX - rect.left, 0), rect.width) / rect.width
      audio.currentTime = ratio * playbackQueueStores.currentPlayingDuration
    }
    const onUp = () => {
      isDragging.value = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // 将onUnmounted移出onMounted之外，放到顶层作用域
  const setupAudioEventListeners = () => {
    const audio = document.querySelector('audio') as HTMLAudioElement | null
    if (!audio) return

    const onPlay = () => (playbackQueueStores.isPlaying = true)
    const onPause = () => (playbackQueueStores.isPlaying = false)
    const onTimeUpdate = () => (playbackQueueStores.currentPlayingTime = audio.currentTime)
    const onEnded = () => {
      // 在单曲循环模式下，重新播放当前歌曲
      if (playbackQueueStores.playMode === 'loop' && playbackQueueStores.currentPlaying) {
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else {
        // 传入true表示这是自动播放结束触发的下一首
        playbackQueueStores.playNext(true)
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }

  let cleanup: (() => void) | undefined

  onMounted(() => {
    cleanup = setupAudioEventListeners()
  })

  onUnmounted(() => {
    if (cleanup) cleanup()
  })

  return { togglePlayPause, startDrag, seekByClick, progressBar, isDragging }
}
