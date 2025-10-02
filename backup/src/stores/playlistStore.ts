import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MusicInfo } from './musicMetaStores'

export const usePlaylistStore = defineStore('playlist', () => {
  const playlist = ref<MusicInfo[]>([])
  const currentPlaying = ref<MusicInfo | null>(null)
  const currentPlayingIndex = ref<number | null>(null)
  
  function setCurrentPlaying(music: MusicInfo | null, index: number | null = null) {
    currentPlaying.value = music
    currentPlayingIndex.value = index
  }
  
  function setPlaylist(list: MusicInfo[]) {
    playlist.value = list
  }
  
  return {
    playlist,
    currentPlaying,
    currentPlayingIndex,
    setCurrentPlaying,
    setPlaylist,
  }
})