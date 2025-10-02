import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { MusicInfo } from './musicMetaStores'

export const usePlaylistStore = defineStore('playlist', () => {
  const playlist = ref<MusicInfo[]>([])
  const isPlaying = ref(false)
  const currentPlaying = ref<MusicInfo | null>(null)
  const currentPlayingIndex = ref<number | null>(null)
  const isPlayingListEmpty = computed(() => !playlist.value.length)
  const playMode = ref('list')
  let msg = ''

  /**
   * 添加歌曲到播放列表（去重处理）
   * @param music 要添加的音乐信息
   */
  function addToPlaylist(music: MusicInfo) {
    const existsIndex = playlist.value.findIndex((item) => item.url === music.url)

    // 检查是否已存在
    if (existsIndex !== -1) {
      // 如果歌曲已存在，直接播放它
      setCurrentPlaying(music, existsIndex)
      return
    }

    playlist.value.push(music)
    setCurrentPlaying(music, playlist.value.length - 1)
  }

  /**
   * 清空播放列表
   */
  function clearPlaylist() {
    playlist.value = []
    setCurrentPlaying(null, null)
    msg = '播放列表已清空'
  }

  /**
   * 从播放列表移除指定索引的歌曲
   * @param index 要移除的歌曲索引
   */
  function removeFromPlaylist(index: number) {
    playlist.value.splice(index, 1)

    // 当前播放的歌曲被移除
    if (currentPlayingIndex.value === index) {
      // 播放列表为空
      if (playlist.value.length === 0) {
        setCurrentPlaying(null, null)
      } else {
        // 选择下一首（如果当前是最后一首则回退到前一首）
        const nextIndex = index < playlist.value.length ? index : index - 1
        setCurrentPlaying(playlist.value[nextIndex], nextIndex)
      }
    }
    // 移除的歌曲在当前播放歌曲之前，更新索引
    else if (currentPlayingIndex.value !== null && currentPlayingIndex.value > index) {
      currentPlayingIndex.value--
    }
  }

  /**
   * 设置当前播放的歌曲和索引
   * @param music 要设置的歌曲（可为null）
   * @param index 要设置的索引（可为null）
   */
  function setCurrentPlaying(music: MusicInfo | null, index: number | null) {
    // 处理清空当前播放
    if (music === null && index === null) {
      currentPlaying.value = null
      currentPlayingIndex.value = null
      return
    }

    // 通过索引查找歌曲
    if (music === null && index !== null) {
      if (index >= 0 && index < playlist.value.length) {
        music = playlist.value[index]
      } else {
        // 索引无效时使用最后一首
        index = playlist.value.length - 1
        music = playlist.value[index]
      }
    }

    // 通过歌曲对象查找索引
    else if (index === null && music !== null) {
      const foundIndex = playlist.value.findIndex((item) => item.url === music!.url)
      if (foundIndex !== -1) {
        index = foundIndex
      } else {
        // 未找到歌曲时使用最后一首
        index = playlist.value.length - 1
        music = playlist.value[index]
      }
    }

    // 确保有有效歌曲
    if (!music || index === null) {
      // 播放列表为空则清空当前播放
      if (playlist.value.length === 0) {
        currentPlaying.value = null
        currentPlayingIndex.value = null
        return
      }
      // 使用最后一首歌曲
      index = playlist.value.length - 1
      music = playlist.value[index]
    }

    currentPlaying.value = music
    currentPlayingIndex.value = index
  }

  /**
   * 播放下一首歌曲
   */
  function playNext() {
    if (currentPlayingIndex.value === null) return

    if (playlist.value.length <= 1) {
      setCurrentPlaying(currentPlaying.value, currentPlayingIndex.value)
      return
    }

    if (playMode.value === 'random') {
      makeItRandom()
      return
    }

    // 计算下一首索引（循环播放）
    const nextIndex =
      currentPlayingIndex.value < playlist.value.length - 1 ? currentPlayingIndex.value + 1 : 0

    setCurrentPlaying(playlist.value[nextIndex], nextIndex)
  }

  /**
   * 播放上一首歌曲
   */
  function playPrevious() {
    if (currentPlayingIndex.value === null) return
    if (playlist.value.length <= 1) {
      setCurrentPlaying(currentPlaying.value, currentPlayingIndex.value)
      return
    }

    if (playMode.value === 'random') {
      makeItRandom()
      return
    }

    // 计算上一首索引（循环播放）
    const prevIndex =
      currentPlayingIndex.value > 0 ? currentPlayingIndex.value - 1 : playlist.value.length - 1

    setCurrentPlaying(playlist.value[prevIndex], prevIndex)
  }

  /**
   * 随机播放下一首歌曲（避免重复播放当前歌曲）
   */
  function makeItRandom() {
    let randomIndex: number
    do {
      randomIndex = Math.floor(Math.random() * playlist.value.length)
    } while (randomIndex === currentPlayingIndex.value && playlist.value.length > 1)

    setCurrentPlaying(playlist.value[randomIndex], randomIndex)
  }

  return {
    playlist,
    currentPlaying,
    currentPlayingIndex,
    isPlaying,
    isPlayingListEmpty,
    msg,
    playMode,
    addToPlaylist,
    removeFromPlaylist,
    setCurrentPlaying,
    playPrevious,
    playNext,
    clearPlaylist,
  }
})
