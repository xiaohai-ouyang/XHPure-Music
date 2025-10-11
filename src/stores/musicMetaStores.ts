import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export interface MusicInfo {
  [key: string]: unknown
  id?: string
  url?: string
  isBilingual?: boolean
  languages?: string[]
}

export const useMusicMetaStore = defineStore('musicMeta', () => {
  const musicList = ref<MusicInfo[]>([])
  const isEmpty = ref(true)

  function addMusic(info: MusicInfo) {
    // 如果没有ID，则添加一个
    if (!info.id) {
      info.id = generateUUID()
    }
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

// 简单的UUID生成函数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
