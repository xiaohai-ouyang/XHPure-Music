import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export interface MusicInfo {
  [key: string]: unknown
  url?: string
}

export const useMusicMetaStore = defineStore('musicMeta', () => {
  const musicList = ref<MusicInfo[]>([])
  const isEmpty = ref(true)

  function addMusic(info: MusicInfo) {
    musicList.value.push(info)
  }

  function clearMusic() {
    musicList.value = []
  }

  watchEffect(() => {
    isEmpty.value = musicList.value.length === 0
  })

  return {
    musicList,
    isEmpty,
    addMusic,
    clearMusic,
  }
})
