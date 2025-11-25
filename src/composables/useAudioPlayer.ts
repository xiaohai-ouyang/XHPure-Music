import { ref, onMounted, onUnmounted } from 'vue'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'
import { useThemeStore } from '@/stores/themeStore'

/**
 * useAudioPlayer()
 * 全面整合版：包含音频播放逻辑 + 交互控制逻辑（进度条拖动、点击跳转）
 */
export function useAudioPlayer() {
  const playbackQueueStore = usePlaybackQueueStore()

  // ======= 音频控制引用 =======
  const getAudioElement = (): HTMLAudioElement | null => {
    return document.querySelector('audio')
  }

  // ======= 进度条交互状态 =======
  const progressBar = ref<HTMLElement | null>(null)
  const isDragging = ref(false)

  // ======= 初始化主题 =======
  onMounted(() => {
    document.title = '椒盐音乐'
    useThemeStore().initTheme()
  })

  // ======= 音频事件回调 =======
  const handleTimeUpdate = () => playbackQueueStore.updateCurrentPlayingTime()
  const handlePlay = () => (playbackQueueStore.isPlaying = true)
  const handlePause = () => (playbackQueueStore.isPlaying = false)

  const handleEnded = () => {
    const audio = getAudioElement()
    if (!audio) return

    if (playbackQueueStore.playMode === 'loop' && playbackQueueStore.currentPlaying) {
      audio.currentTime = 0
      audio.play().catch(console.error)
    } else {
      playbackQueueStore.playNext(true)
    }
  }

  // ======= 控制逻辑（播放/暂停、进度条） =======
  const togglePlayPause = () => {
    const audio = getAudioElement()
    if (!audio) return
    if (playbackQueueStore.isPlaying) audio.pause()
    else audio.play().catch(console.error)
  }

  const seekByClick = (event: MouseEvent) => {
    const bar = progressBar.value
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const audio = getAudioElement()
    if (!audio) return
    audio.currentTime = ratio * playbackQueueStore.currentPlayingDuration
  }

  const startDrag = () => {
    isDragging.value = true
    const audio = getAudioElement()
    if (!audio) return

    const onMove = (e: MouseEvent) => {
      const bar = progressBar.value
      if (!bar) return
      const rect = bar.getBoundingClientRect()
      const ratio = Math.min(Math.max(e.clientX - rect.left, 0), rect.width) / rect.width
      audio.currentTime = ratio * playbackQueueStore.currentPlayingDuration
    }
    const onUp = () => {
      isDragging.value = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ======= 卸载清理 =======
  onUnmounted(() => {
    // 不需要清理，因为 audio 元素在 App.vue 中管理
  })

  // ======= 返回可用接口 =======
  return {
    // 音频事件绑定
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,

    // 播放控制逻辑
    togglePlayPause,
    seekByClick,
    startDrag,

    // 进度条控制
    progressBar,
    isDragging,
  }
}
