import { onUnmounted, type Ref } from 'vue'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'
import { useProgressBar } from './useProgressBar'

export function useAudioPlayer(): {
  handleTimeUpdate: () => void
  handlePlay: () => void
  handlePause: () => void
  handleEnded: () => void
  togglePlayPause: () => void
  seekByClick: (e: MouseEvent) => void
  startDrag: (e: MouseEvent) => void
  progressBar: Ref<HTMLElement | null>
  isDragging: Ref<boolean>
} {
  const playbackQueueStore = usePlaybackQueueStore()
  const { progressBar, isDragging, seekByClick, startDrag } = useProgressBar()
  const getAudioElement = (): HTMLAudioElement | null => {
    return document.querySelector('audio')
  }
  const handleTimeUpdate = () => {
    const audio = getAudioElement()
    if (audio) {
      playbackQueueStore.updateCurrentPlayingTime(audio.currentTime, audio.duration)
    }
  }
  const handlePlay = () => (playbackQueueStore.isPlaying = true)
  const handlePause = () => (playbackQueueStore.isPlaying = false)
  const handleEnded = () => {
    const audio = getAudioElement()
    if (!audio) return

    const isLoopMode = playbackQueueStore.playMode === 'loop'
    const hasCurrentPlaying = Boolean(playbackQueueStore.currentPlaying)

    if (isLoopMode && hasCurrentPlaying) {
      audio.currentTime = 0
      audio.play().catch(console.error)
    } else {
      playbackQueueStore.playNext(true)
    }
  }

  const togglePlayPause = () => {
    const audio = getAudioElement()
    if (!audio) return

    const isPlaying = playbackQueueStore.isPlaying
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isPlaying ? audio.pause() : audio.play().catch(console.error)
  }

  onUnmounted(() => {})

  return {
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    togglePlayPause,
    seekByClick,
    startDrag,
    progressBar,
    isDragging,
  }
}
