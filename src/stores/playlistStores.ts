import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type MusicInfo } from './musicMetaStores'
import type { Playlist, Track } from '@/types/fileSystem'
import { useMessageStore } from '@/stores/messageStore'
const messageStore = useMessageStore()

// 从localStorage加载播放列表数据
const loadPlaylistsFromLocalStorage = (): Playlist[] => {
  const stored = localStorage.getItem('xhpure_playlists')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      messageStore.showError('解析播放列表数据失败')
      console.error('Failed to parse playlists from localStorage', e)
    }
  }

  // 默认播放列表
  return [
    {
      id: 'favorite',
      name: '我最喜欢的',
      cover: '/src/assets/images/favorite.png',
      tracks: [],
    },
  ]
}

// 保存播放列表数据到localStorage
const savePlaylistsToLocalStorage = (playlists: Playlist[]) => {
  try {
    localStorage.setItem('xhpure_playlists', JSON.stringify(playlists))
  } catch (e) {
    messageStore.showError('保存播放列表数据失败')
    console.error('Failed to save playlists to localStorage', e)
  }
}

export const usePlaylistStore = defineStore('playlist', () => {
  // 初始化时确保有一个"我最喜欢的"歌单
  const initialPlaylists = loadPlaylistsFromLocalStorage()
  const playlist = ref<Playlist[]>(initialPlaylists)
  const msg = ref('')

  /**
   * 添加新歌单
   * @param newPlaylist 新歌单对象
   */
  function createPlaylist(newPlaylist: Playlist) {
    if (!newPlaylist.name) return (msg.value = '歌单名称不能为空')

    // 歌单名称校检
    if (playlist.value.find((pl: Playlist) => pl.name === newPlaylist.name)) {
      return (msg.value = '歌单名称已存在，请更换名称')
    }

    if (!newPlaylist.id) {
      return (msg.value = '歌单ID不能为空')
    }

    playlist.value.push(newPlaylist)
    savePlaylistsToLocalStorage(playlist.value)
    msg.value = '添加歌单成功'
  }

  /**
   * 向歌单中添加歌曲
   * @param id 歌单ID
   * @param music 歌曲信息
   */
  function addInPlaylist(id: string, music: MusicInfo) {
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
      savePlaylistsToLocalStorage(playlist.value)
    }
  }

  /**
   * 清空指定歌单中的所有歌曲
   * @param id 歌单ID
   */
  function clearPlaylistTracks(id: string) {
    const pl = playlist.value.find((pl: Playlist) => pl.id === id)
    if (pl) {
      pl.tracks = []
      savePlaylistsToLocalStorage(playlist.value)
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
  function updatePlaylists(playlists: Playlist[]) {
    playlist.value = playlists
    savePlaylistsToLocalStorage(playlists)
  }

  /**
   * 根据歌曲的md5和duration更新歌单中track的id
   * @param music 歌曲信息
   */
  function updateTrackIdByMusic(music: MusicInfo) {
    if (!music.md5 || !music.duration || !music.id) return

    for (const pl of playlist.value) {
      for (const track of pl.tracks) {
        if (track.md5 === music.md5 && track.duration === music.duration) {
          track.id = music.id
        }
      }
    }
    savePlaylistsToLocalStorage(playlist.value)
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
    createPlaylist,
    addInPlaylist,
    clearPlaylistTracks,
    getPlaylists,
    updatePlaylists,
    updateTrackIdByMusic,
    getTracksByMusicId,
  }
})
