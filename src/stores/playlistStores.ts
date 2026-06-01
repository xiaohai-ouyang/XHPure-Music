import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type MusicInfo } from './musicMetaStores'
import type { Playlist, Track } from '@/types/fileSystem'
import { useMessageStore } from '@/stores/messageStore'
import favoriteCover from '@/assets/images/favorite.png'

const PLAYLIST_STORAGE_KEY = 'xhpure_playlists'

const createDefaultPlaylists = (): Playlist[] => [
  {
    id: 'favorite',
    name: '我最喜欢的',
    cover: favoriteCover,
    tracks: [],
  },
]

const loadPlaylistsFromLocalStorage = (): Playlist[] | null => {
  const stored = localStorage.getItem(PLAYLIST_STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : null
  } catch (e) {
    console.error('Failed to parse playlists from localStorage', e)
    return null
  }
}

const savePlaylistsToLocalStorage = (playlists: Playlist[]) => {
  localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlists))
}

export const usePlaylistStore = defineStore('playlist', () => {
  const messageStore = useMessageStore()
  const playlist = ref<Playlist[]>(
    window.xhElectron
      ? createDefaultPlaylists()
      : (loadPlaylistsFromLocalStorage() ?? createDefaultPlaylists()),
  )
  const msg = ref('')
  const isLoaded = ref(!window.xhElectron)
  const hasPlaylistLoadError = ref(false)

  let initializationPromise: Promise<void> | null = null

  async function persistPlaylists(playlists = playlist.value): Promise<boolean> {
    try {
      if (window.xhElectron) {
        if (hasPlaylistLoadError.value) {
          messageStore.showError('歌单数据库读取失败，已停止写入以避免覆盖原文件')
          return false
        }

        await window.xhElectron.savePlaylists(playlists)
      } else {
        savePlaylistsToLocalStorage(playlists)
      }

      return true
    } catch (e) {
      messageStore.showError('保存歌单数据失败')
      console.error('Failed to save playlists', e)
      return false
    }
  }

  async function initializePlaylists() {
    if (!window.xhElectron) {
      isLoaded.value = true
      return
    }

    try {
      hasPlaylistLoadError.value = false
      const dbPlaylists = await window.xhElectron.loadPlaylists()

      if (dbPlaylists.length > 0) {
        playlist.value = dbPlaylists
        return
      }

      const legacyPlaylists = loadPlaylistsFromLocalStorage()
      if (legacyPlaylists && legacyPlaylists.length > 0) {
        playlist.value = legacyPlaylists
        if (await persistPlaylists(legacyPlaylists)) {
          localStorage.removeItem(PLAYLIST_STORAGE_KEY)
        }
        return
      }

      playlist.value = createDefaultPlaylists()
      await persistPlaylists()
    } catch (e) {
      hasPlaylistLoadError.value = true
      messageStore.showError('加载歌单数据失败')
      console.error('Failed to load playlists', e)
    } finally {
      isLoaded.value = true
    }
  }

  function ensureInitialized() {
    if (!initializationPromise) {
      initializationPromise = initializePlaylists()
    }

    return initializationPromise
  }

  void ensureInitialized()

  /**
   * 添加新歌单
   * @param newPlaylist 新歌单对象
   */
  async function createPlaylist(newPlaylist: Playlist) {
    await ensureInitialized()

    if (!newPlaylist.name) return (msg.value = '歌单名称不能为空')

    // 歌单名称校验
    if (playlist.value.find((pl: Playlist) => pl.name === newPlaylist.name)) {
      return (msg.value = '歌单名称已存在，请更换名称')
    }

    if (!newPlaylist.id) {
      return (msg.value = '歌单ID不能为空')
    }

    playlist.value.push(newPlaylist)
    if (await persistPlaylists()) {
      msg.value = '添加歌单成功'
    } else {
      msg.value = '保存歌单数据失败'
    }
  }

  /**
   * 向歌单中添加歌曲
   * @param id 歌单ID
   * @param music 歌曲信息
   */
  async function addInPlaylist(id: string, music: MusicInfo) {
    await ensureInitialized()

    const pl = playlist.value.find((pl: Playlist) => pl.id === id)
    if (
      pl &&
      music.md5 &&
      music.duration &&
      music.title &&
      typeof music.title === 'string' &&
      music.id
    ) {
      // 检查是否重复歌曲（md5、duration相同）
      const isDuplicate = pl.tracks.some(
        (track: Track) => track.md5 === music.md5 && track.duration === music.duration,
      )

      if (isDuplicate) {
        return (msg.value = `歌单中已有“${music.title}”`)
      }

      const track: Track = {
        id: music.id,
        title: music.title,
        duration: typeof music.duration === 'number' ? music.duration : Number(music.duration),
        md5: music.md5,
      }
      pl.tracks.push(track)
      await persistPlaylists()
    }
  }

  /**
   * 清空指定歌单中的所有歌曲
   * @param id 歌单ID
   */
  async function clearPlaylistTracks(id: string) {
    await ensureInitialized()

    const pl = playlist.value.find((pl: Playlist) => pl.id === id)
    if (pl) {
      pl.tracks = []
      await persistPlaylists()
      msg.value = '已清空歌单'
    }
  }

  /**
   * 获取所有歌单
   * @returns 歌单列表
   */
  function getPlaylists() {
    return playlist.value
  }

  /**
   * 更新播放列表（用于从外部更新整个播放列表）
   * @param playlists 新的播放列表
   */
  async function updatePlaylists(playlists: Playlist[]) {
    await ensureInitialized()

    playlist.value = playlists
    await persistPlaylists(playlists)
  }

  /**
   * 根据歌曲的md5和duration更新歌单中track的id
   * @param music 歌曲信息
   */
  async function updateTrackIdByMusic(music: MusicInfo) {
    await ensureInitialized()

    if (!music.md5 || !music.duration || !music.id) return

    for (const pl of playlist.value) {
      for (const track of pl.tracks) {
        if (track.md5 === music.md5 && track.duration === music.duration) {
          track.id = music.id
        }
      }
    }
    await persistPlaylists()
  }

  /**
   * 批量根据歌曲的md5和duration更新歌单中track的id
   * @param musicList 歌曲信息列表
   */
  async function updateTrackIdsByMusicList(musicList: MusicInfo[]) {
    await ensureInitialized()

    let hasChanges = false
    // 创建一个查找映射以提高性能
    // key: `${md5}-${duration}`, value: id
    const musicMap = new Map<string, string>()

    for (const music of musicList) {
      if (music.md5 && music.duration && music.id) {
        musicMap.set(`${music.md5}-${music.duration}`, music.id)
      }
    }

    if (musicMap.size === 0) return

    for (const pl of playlist.value) {
      for (const track of pl.tracks) {
        const key = `${track.md5}-${track.duration}`
        if (musicMap.has(key)) {
          const newId = musicMap.get(key)
          if (newId && track.id !== newId) {
            track.id = newId
            hasChanges = true
          }
        }
      }
    }

    if (hasChanges) {
      await persistPlaylists()
    }
  }

  /**
   * 根据歌曲ID获取歌曲在歌单中的track信息
   * @param musicId 歌曲ID
   * @returns 匹配的track列表
   */
  function getTracksByMusicId(musicId: string): { playlistId: string; track: Track }[] {
    const result: { playlistId: string; track: Track }[] = []

    for (const pl of playlist.value) {
      for (const track of pl.tracks) {
        if (track.id === musicId) {
          result.push({ playlistId: pl.id, track })
        }
      }
    }

    return result
  }

  return {
    playlist,
    msg,
    isLoaded,
    initializePlaylists,
    createPlaylist,
    addInPlaylist,
    clearPlaylistTracks,
    getPlaylists,
    updatePlaylists,
    updateTrackIdByMusic,
    updateTrackIdsByMusicList,
    getTracksByMusicId,
  }
})
