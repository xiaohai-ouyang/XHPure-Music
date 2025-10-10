// stores/playlistStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 假设 MusicInfo 已定义
import type { MusicInfo } from './musicMetaStores'

// 播放模式类型
export type PlayMode = 'list' | 'loop' | 'random'

// 播放模式配置
const PLAY_MODES: PlayMode[] = ['list', 'random', 'loop']
const MODE_ICONS: Record<PlayMode, string> = {
  list: '&#xea22;',
  random: '&#xe734;',
  loop: '&#xe727;',
}
const MODE_LABELS: Record<PlayMode, string> = {
  list: '列表循环',
  random: '随机播放',
  loop: '单曲循环',
}

export const usePlaylistStore = defineStore('playlist', () => {
  // 状态
  const playlist = ref<MusicInfo[]>([])
  const isPlaying = ref(false)
  const playMode = ref<PlayMode>('list')
  const currentPlayingId = ref<string | null>(null)

  const currentPlayingTime = ref<number>()
  const currentPlayingDuration = ref<number>()

  const isPlayingListEmpty = computed(() => playlist.value.length === 0)
  const currentPlaying = computed(() => {
    if (currentPlayingId.value === null) return null
    return playlist.value.find((music) => music.id === currentPlayingId.value) || null
  })

  const playModeIcon = computed(() => MODE_ICONS[playMode.value])
  const playModeLabel = computed(() => MODE_LABELS[playMode.value])

  /**
   * 获取当前播放时间
   */
  function getCurrentPlayingTime() {
    if (currentPlayingId.value === null) return null

    const audioElement = document.querySelector('audio')
    if (!audioElement) return null

    currentPlayingTime.value = audioElement.currentTime
    currentPlayingDuration.value = audioElement.duration
  }

  /**
   * 添加歌曲到播放列表（去重）
   */
  function addToPlaylist(music: MusicInfo) {
    // 确保音乐有ID
    const musicWithId = ensureMusicHasId(music)

    const existsIndex = playlist.value.findIndex((item) => item.url === musicWithId.url)
    if (existsIndex !== -1) {
      setCurrentPlaying(musicWithId)
      return
    }

    playlist.value.push(musicWithId)
    setCurrentPlaying(musicWithId)
  }

  /**
   * 设置当前播放歌曲（通过音乐对象）
   */
  function setCurrentPlaying(music: MusicInfo | null) {
    if (music === null || !music.id) {
      currentPlayingId.value = null
      return
    }

    currentPlayingId.value = music.id
  }

  /**
   * 清空播放列表
   */
  function clearPlaylist() {
    playlist.value = []
    currentPlayingId.value = null
    isPlaying.value = false
  }

  function removeFromPlaylist(musicId: string) {
    const index = playlist.value.findIndex((music) => music.id === musicId)
    if (index < 0 || index >= playlist.value.length) return

    const wasCurrent = musicId === currentPlayingId.value

    playlist.value.splice(index, 1)

    if (playlist.value.length === 0) {
      currentPlayingId.value = null
      isPlaying.value = false
    } else if (wasCurrent) {
      const nextIndex = index >= playlist.value.length ? index - 1 : index
      if (playlist.value[nextIndex]) {
        setCurrentPlaying(playlist.value[nextIndex])
      }
    }
  }

  function playNext() {
    if (isPlayingListEmpty.value || currentPlayingId.value === null) return

    const currentIndex = playlist.value.findIndex((music) => music.id === currentPlayingId.value)
    if (currentIndex === -1) return

    let nextIndex: number

    if (playMode.value === 'random') {
      nextIndex = makeRandomIndex()
    } else {
      // 'list' 和 'loop'：顺序播放，到末尾时根据模式决定是否循环
      if (currentIndex < playlist.value.length - 1) {
        nextIndex = currentIndex + 1
      } else {
        nextIndex = playMode.value === 'loop' || playMode.value === 'list' ? 0 : currentIndex
      }
    }

    if (playlist.value[nextIndex]) {
      setCurrentPlaying(playlist.value[nextIndex])
    }
  }

  function playPrevious() {
    if (isPlayingListEmpty.value || currentPlayingId.value === null) return

    const currentIndex = playlist.value.findIndex((music) => music.id === currentPlayingId.value)
    if (currentIndex === -1) return

    let prevIndex: number

    if (playMode.value === 'random') {
      prevIndex = makeRandomIndex()
    } else {
      if (currentIndex > 0) {
        prevIndex = currentIndex - 1
      } else {
        prevIndex =
          playMode.value === 'loop' || playMode.value === 'list'
            ? playlist.value.length - 1
            : currentIndex
      }
    }

    if (playlist.value[prevIndex]) {
      setCurrentPlaying(playlist.value[prevIndex])
    }
  }

  /**
   * 生成一个不同于当前的随机索引
   */
  function makeRandomIndex(): number {
    if (playlist.value.length <= 1) {
      const currentIndex = playlist.value.findIndex((music) => music.id === currentPlayingId.value)
      return currentIndex === -1 ? 0 : currentIndex
    }

    let randomIndex: number
    const currentIndex = playlist.value.findIndex((music) => music.id === currentPlayingId.value)
    do {
      randomIndex = Math.floor(Math.random() * playlist.value.length)
    } while (randomIndex === currentIndex)

    return randomIndex
  }

  /**
   * 切换播放模式（循环切换）
   */
  function cyclePlayMode() {
    const currentIndex = PLAY_MODES.indexOf(playMode.value)
    const nextIndex = (currentIndex + 1) % PLAY_MODES.length
    playMode.value = PLAY_MODES[nextIndex]
  }

  /**
   * 确保音乐信息包含ID
   */
  function ensureMusicHasId(music: MusicInfo): MusicInfo {
    if (music.id) {
      return music
    }

    return {
      ...music,
      id: generateUUID(),
    }
  }

  /**
   * 生成UUID
   */
  function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  return {
    // state
    playlist,
    currentPlayingId,
    isPlaying,
    playMode,
    currentPlayingTime,
    currentPlayingDuration,

    // getters
    isPlayingListEmpty,
    currentPlaying,
    playModeIcon,
    playModeLabel,

    // actions
    addToPlaylist,
    setCurrentPlaying,
    removeFromPlaylist,
    clearPlaylist,
    playNext,
    playPrevious,
    cyclePlayMode,
    getCurrentPlayingTime,
  }
})
