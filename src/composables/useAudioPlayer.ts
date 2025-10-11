import { ref, onMounted, onUnmounted } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'

export function useAudioPlayer() {
  const playlistStore = usePlaylistStore()
  const isDragging = ref(false)
  const progressBar = ref<HTMLElement | null>(null)

  const togglePlayPause = () => {
    const audio = document.querySelector('audio') as HTMLAudioElement | null
    if (!audio) return
    if (playlistStore.isPlaying) audio.pause()
    else audio.play().catch(console.error)
  }

  const seekByClick = (event: MouseEvent) => {
    const bar = progressBar.value
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const audio = document.querySelector('audio') as HTMLAudioElement | null
    if (!audio) return
    audio.currentTime = ratio * playlistStore.currentPlayingDuration
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
      audio.currentTime = ratio * playlistStore.currentPlayingDuration
    }
    const onUp = () => {
      isDragging.value = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  onMounted(() => {
    const audio = document.querySelector('audio') as HTMLAudioElement | null
    if (!audio) return
    const onPlay = () => (playlistStore.isPlaying = true)
    const onPause = () => (playlistStore.isPlaying = false)
    const onTimeUpdate = () => (playlistStore.currentPlayingTime = audio.currentTime)
    const onEnded = () => {
      // 在单曲循环模式下，重新播放当前歌曲
      if (playlistStore.playMode === 'loop' && playlistStore.currentPlaying) {
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else {
        // 传入true表示这是自动播放结束触发的下一首
        playlistStore.playNext(true)
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    onUnmounted(() => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    })
  })

  return { togglePlayPause, startDrag, seekByClick, progressBar, isDragging }
}
