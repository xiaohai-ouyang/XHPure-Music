import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import { generateShortId } from '@/utils/idGenerator'

export interface MusicInfo {
  [key: string]: unknown
  id?: string
  url?: string
  isBilingual?: boolean
  languages?: string[]
  duration?: number
  md5?: string
}

export const useMusicMetaStore = defineStore('musicMeta', () => {
  const musicList = ref<MusicInfo[]>([])
  const isEmpty = ref(true)

  function addMusic(info: MusicInfo) {
    if (!info.id) {
      info.id = generateShortId()
    }
    musicList.value.push(info)
  }

  function clearMusic() {
    musicList.value = []
  }

  watchEffect(() => {
    isEmpty.value = musicList.value.length === 0
  })

  const totalDuration = computed(() => {
    return musicList.value.reduce((total, music) => {
      return total + (typeof music.duration === 'number' ? music.duration : 0)
    }, 0)
  })

  return {
    musicList,
    isEmpty,
    totalDuration,
    addMusic,
    clearMusic,
  }
})