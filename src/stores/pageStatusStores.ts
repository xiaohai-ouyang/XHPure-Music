import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePageStatusStore = defineStore('pageStatus', () => {
  const isNavContracted = ref(false)
  const isPlaylistShow = ref(false)
  const isPlayBackExpand = ref(false)
  const pageWidth = ref<number>(0)
  const currentPageTitle = ref<string>('歌曲')

  function toggleNav() {
    isNavContracted.value = !isNavContracted.value
  }

  function togglePlaylist() {
    isPlaylistShow.value = !isPlaylistShow.value
  }

  return {
    isNavContracted,
    pageWidth,
    currentPageTitle,
    isPlaylistShow,
    isPlayBackExpand,
    toggleNav,
    togglePlaylist,
  }
})
