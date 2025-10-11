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
  loop: '&#xe727;', // 单曲循环
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
  const lyricActiveLineIndex = ref(-1)
  const lyricScrollTop = ref(0)

  /**
   * 设置歌词高亮行索引
   * @param index 行索引
   */
  function setLyricActiveLineIndex(index: number) {
    lyricActiveLineIndex.value = index
  }

  /**
   * 设置歌词滚动位置
   * @param top 滚动位置
   */
  function setLyricScrollTop(top: number) {
    lyricScrollTop.value = top
  }

  /**
   * 播放列表是否为空
   */
  const isPlayingListEmpty = computed(() => playlist.value.length === 0)

  /**
   * 当前播放的歌曲信息
   */
  const currentPlaying = computed<MusicInfo | null>(() => {
    if (!currentPlayingId.value) return null
    return playlist.value.find((music) => music.id === currentPlayingId.value) || null
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
   */
  function playNext() {
    if (isPlayingListEmpty.value || !currentPlayingId.value) return

    const currentIndex = playlist.value.findIndex((m) => m.id === currentPlayingId.value)
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    if (playMode.value === 'random') {
      nextIndex = makeRandomIndex()
    } else if (playMode.value === 'list') {
      nextIndex = currentIndex < playlist.value.length - 1 ? currentIndex + 1 : 0
    } else if (playMode.value === 'loop') {
      nextIndex = currentIndex // 单曲循环
    }

    if (playlist.value[nextIndex]) {
      setCurrentPlaying(playlist.value[nextIndex])
    }
  }

  /**
   * 播放上一首
   */
  function playPrevious() {
    if (isPlayingListEmpty.value || !currentPlayingId.value) return

    const currentIndex = playlist.value.findIndex((m) => m.id === currentPlayingId.value)
    if (currentIndex === -1) return

    let prevIndex = currentIndex

    if (playMode.value === 'random') {
      prevIndex = makeRandomIndex()
    } else if (playMode.value === 'list') {
      prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.value.length - 1
    } else if (playMode.value === 'loop') {
      prevIndex = currentIndex
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
    if (playlist.value.length <= 1) {
      const currentIndex = playlist.value.findIndex((m) => m.id === currentPlayingId.value)
      return currentIndex === -1 ? 0 : currentIndex
    }

    let randomIndex: number
    const currentIndex = playlist.value.findIndex((m) => m.id === currentPlayingId.value)

    do {
      randomIndex = Math.floor(Math.random() * playlist.value.length)
    } while (randomIndex === currentIndex)

    return randomIndex
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

  return {
    // state
    playlist,
    isPlaying,
    playMode,
    currentPlayingId,
    currentPlayingTime,
    currentPlayingDuration,
    lyricActiveLineIndex,
    lyricScrollTop,

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
    updateCurrentPlayingTime,
    setLyricActiveLineIndex,
    setLyricScrollTop,
  }
})
