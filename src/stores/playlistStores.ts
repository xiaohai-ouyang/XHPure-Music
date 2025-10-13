import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlaylistStore = defineStore('playlist', () => {
  // 初始化时确保有一个"我最喜欢的"歌单
  const initialPlaylists: Playlist[] = [
    {
      id: 'favorite',
      name: '我喜欢',
      cover: '/src/assets/images/logo.png',
      tracks: [],
    },
  ]

  const playlist = ref<Playlist[]>(initialPlaylists)
  const msg = ref('')

  /**
   * 添加新歌单
   * @param newPlaylist 新歌单对象
   */
  function createPlaylist(newPlaylist: Playlist) {
    if (!newPlaylist.name) return (msg.value = '歌单名称不能为空')

    // 歌单名称校检
    // if (playlist.value.find((pl) => pl.name === newPlaylist.name)) {
    //   return (msg.value = '歌单名称已存在，请更换名称')
    // }

    if (!newPlaylist.id) {
      return (msg.value = '歌单ID不能为空')
    }

    playlist.value.push(newPlaylist)
    msg.value = '添加歌单成功'
  }

  // function autoGetCover() {
  //   playlist.value.forEach((pl) => {
  //     console.log(pl)
  //   })
  // }

  /**
   * 获取所有歌单
   * @returns 歌单列表
   */
  function getPlaylists() {
    return playlist.value
  }

  return {
    playlist,
    msg,
    createPlaylist,
    getPlaylists,
  }
})
