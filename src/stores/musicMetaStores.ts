import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateShortId } from '@/utils/idGenerator'

import type { MusicInfo } from '@/types/musicTypes'

export type { MusicInfo }

export const useMusicMetaStore = defineStore('musicMeta', () => {
  const musicList = ref<MusicInfo[]>([])
  const isEmpty = computed(() => musicList.value.length === 0)

  function addMusic(info: MusicInfo) {
    if (!info.id) {
      info.id = generateShortId()
    }
    musicList.value.push(info)
  }

  function addMusicList(infos: MusicInfo[]) {
    const newInfos = infos.map((info) => {
      if (!info.id) {
        info.id = generateShortId()
      }
      return info
    })
    musicList.value.push(...newInfos)
  }

  function clearMusic() {
    musicList.value = []
  }

  // watchEffect removed as isEmpty is now a computed property

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
    addMusicList,
    clearMusic,
  }
})
