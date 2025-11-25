import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
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
    clearMusic,
  }
})
