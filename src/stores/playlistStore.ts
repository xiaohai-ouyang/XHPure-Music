// stores/playlistStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 假设 MusicInfo 已定义
import type { MusicInfo } from './musicMetaStores'

// 播放模式类型
export type PlayMode = 'list' | 'loop' | 'random'

// 播放模式配置
const PLAY_MODES: PlayMode[] = ['list', 'random', 'loop']

/**
 * 播放模式对应的图标
 */
const MODE_ICONS: Record<PlayMode, string> = {
  list: '&#xea22;', // 列表循环
  random: '&#xe734;', // 随机播放
  loop: '&#xe602;', // 单曲循环
}

/**
 * 播放模式对应的标签文本
 */
const MODE_LABELS: Record<PlayMode, string> = {
  list: '列表循环',
  random: '随机播放',
  loop: '单曲循环',
}

export const usePlaylistStore = defineStore('playlist', () => {
  // ============
  // 🔹 State
  // ============
  /**
   * 播放列表
   */
  const playlist = ref<MusicInfo[]>([])
  /**
   * 是否正在播放
   */
  const isPlaying = ref(false)
  /**
   * 播放模式
   */
  const playMode = ref<PlayMode>('list')
  /**
   * 当前播放歌曲的ID
   */
  const currentPlayingId = ref<string | null>(null)

  /**
   * 当前播放时间
   */
  const currentPlayingTime = ref(0)
  /**
   * 当前歌曲总时长
   */
  const currentPlayingDuration = ref(0)

  // 歌词高亮行索引和滚动位置

  const removeChinese = ref(false)

  // 每首歌曲的中文显示状态
  const songChineseStates = ref<Record<string, boolean>>({})

  /**
   * 设置特定歌曲的中文显示状态
   * @param songId 歌曲ID
   * @param state 是否隐藏中文
   */
  function setSongChineseState(songId: string, state: boolean) {
    songChineseStates.value[songId] = state
  }

  /**
   * 播放列表是否为空
   */
  const isPlaylistEmpty = computed(() => playlist.value.length === 0)

  /**
   * 当前播放的歌曲信息
   */
  const currentPlaying = computed<MusicInfo | null>(() => {
    if (!currentPlayingId.value) return null
    return playlist.value.find((music) => music.id === currentPlayingId.value) || null
  })

  // 当前播放歌曲的中文显示状态
  const currentSongRemoveChinese = computed(() => {
    if (!currentPlayingId.value) return false
    return songChineseStates.value[currentPlayingId.value] ?? false
  })

  /**
   * 当前播放模式的图标
   */
  const playModeIcon = computed(() => MODE_ICONS[playMode.value])

  /**
   * 当前播放模式的标签文本
   */
  const playModeLabel = computed(() => MODE_LABELS[playMode.value])

  /**
   * 更新当前播放时间和总时长
   */
  function updateCurrentPlayingTime() {
    if (!currentPlayingId.value) return
    const audioElement = document.querySelector('audio')
    if (!audioElement || isNaN(audioElement.duration)) return

    currentPlayingTime.value = audioElement.currentTime
    currentPlayingDuration.value = audioElement.duration
  }

  /**
   * 添加歌曲到播放列表（去重）
   * @param music 要添加的歌曲信息
   */
  function addToPlaylist(music: MusicInfo) {
    const musicWithId = ensureMusicHasId(music)
    const existsIndex = playlist.value.findIndex((item) => item.url === musicWithId.url)

    if (existsIndex !== -1) {
      // 已存在 -> 直接切换当前播放
      setCurrentPlaying(playlist.value[existsIndex])
      return
    }

    playlist.value.push(musicWithId)
    setCurrentPlaying(musicWithId)
  }

  /**
   * 设置当前播放歌曲
   * @param music 要设置为当前播放的歌曲信息
   */
  function setCurrentPlaying(music: MusicInfo | null) {
    if (!music || !music.id) {
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

  /**
   * 从播放列表中移除歌曲
   * @param musicId 要移除的歌曲ID
   */
  function removeFromPlaylist(musicId: string) {
    const index = playlist.value.findIndex((music) => music.id === musicId)
    if (index === -1) return

    const wasCurrent = musicId === currentPlayingId.value
    playlist.value.splice(index, 1)

    // 同时删除该歌曲的中文显示状态
    delete songChineseStates.value[musicId]

    if (playlist.value.length === 0) {
      currentPlayingId.value = null
      isPlaying.value = false
    } else if (wasCurrent) {
      // 播放下一个合理位置的曲目
      const nextIndex = Math.min(index, playlist.value.length - 1)
      setCurrentPlaying(playlist.value[nextIndex])
    }
  }

  /**
   * 播放下一首
   * @param isAutoPlayNext 是否为自动播放下一首（如歌曲播放结束触发）
   */
  function playNext(isAutoPlayNext = false) {
    if (isPlaylistEmpty.value || !currentPlayingId.value) return

    const currentIndex = playlist.value.findIndex((m) => m.id === currentPlayingId.value)
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    if (playMode.value === 'random') {
      nextIndex = makeRandomIndex()
    } else if (playMode.value === 'list') {
      nextIndex = currentIndex < playlist.value.length - 1 ? currentIndex + 1 : 0
    } else if (playMode.value === 'loop') {
      // 如果是自动播放下一首，则保持单曲循环
      // 如果是手动点击下一曲，则切换到下一首歌曲
      if (isAutoPlayNext) {
        nextIndex = currentIndex // 单曲循环
      } else {
        nextIndex = currentIndex < playlist.value.length - 1 ? currentIndex + 1 : 0
      }
    }

    if (playlist.value[nextIndex]) {
      setCurrentPlaying(playlist.value[nextIndex])
    }
  }

  /**
   * 播放上一首
   * @param isAutoPlayPrevious 是否为自动播放上一首
   */
  function playPrevious(isAutoPlayPrevious = false) {
    if (isPlaylistEmpty.value || !currentPlayingId.value) return

    const currentIndex = playlist.value.findIndex((m) => m.id === currentPlayingId.value)
    if (currentIndex === -1) return

    let prevIndex = currentIndex

    if (playMode.value === 'random') {
      prevIndex = makeRandomIndex()
    } else if (playMode.value === 'list') {
      prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.value.length - 1
    } else if (playMode.value === 'loop') {
      // 如果是自动播放上一首，则保持单曲循环
      // 如果是手动点击上一曲，则切换到上一首歌曲
      if (isAutoPlayPrevious) {
        prevIndex = currentIndex
      } else {
        prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.value.length - 1
      }
    }

    if (playlist.value[prevIndex]) {
      setCurrentPlaying(playlist.value[prevIndex])
    }
  }

  /**
   * 生成一个不同于当前播放曲目的随机索引
   * @returns 随机索引
   */
  function makeRandomIndex(): number {
    const len = playlist.value.length
    if (len <= 1) return 0
    const current = playlist.value.findIndex((m) => m.id === currentPlayingId.value)
    let next
    do next = Math.floor(Math.random() * len)
    while (next === current)
    return next
  }

  /**
   * 切换播放模式（列表 → 随机 → 单曲 → 列表）
   * @returns 当前播放模式的标签文本
   */
  function cyclePlayMode(): string {
    const currentIndex = PLAY_MODES.indexOf(playMode.value)
    const nextIndex = (currentIndex + 1) % PLAY_MODES.length
    playMode.value = PLAY_MODES[nextIndex]
    return playModeLabel.value // 可返回提示文字给 UI 使用
  }

  /**
   * 确保音乐信息包含唯一 ID
   * @param music 音乐信息
   * @returns 包含唯一ID的音乐信息
   */
  function ensureMusicHasId(music: MusicInfo): MusicInfo {
    if (music.id) return music
    return { ...music, id: generateUUID() }
  }

  /**
   * 生成 UUID
   * @returns UUID字符串
   */
  function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * 格式化时间（秒）为 mm:ss 格式
   * @param seconds 时间（秒）
   * @returns 格式化后的时间字符串 mm:ss
   */
  function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '00:00'

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * 格式化时间为负数形式（用于显示剩余时间）
   * @param currentTime 当前播放时间（秒）
   * @param duration 总时长（秒）
   * @returns 格式化后的负时间字符串 -mm:ss
   */
  function formatNegativeTime(currentTime: number, duration: number): string {
    if (isNaN(currentTime) || currentTime < 0 || isNaN(duration) || duration <= 0) return '-00:00'

    const remainingTime = duration - currentTime
    const mins = Math.floor(remainingTime / 60)
    const secs = Math.floor(remainingTime % 60)

    return `-${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    // state
    playlist,
    isPlaying,
    playMode,
    currentPlayingId,
    currentPlayingTime,
    currentPlayingDuration,

    removeChinese,
    songChineseStates,
    currentSongRemoveChinese,

    // getters
    isPlaylistEmpty,
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
    updateCurrentPlayingTime,
    setSongChineseState,
    formatTime,
    formatNegativeTime,
  }
})
