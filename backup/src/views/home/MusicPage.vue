<template>
  <div class="jiaoyan-music">
    <button @click="pickMusic" :disabled="loading" v-if="useMusicMetaStore().isEmpty">
      <span>添加音乐</span>
    </button>

    <div class="music-item-box">
      <div
        class="music-item"
        :class="{ isPlaying: currentPlayingIndex === index }"
        v-for="(music, index) in useMusicMetaStore().musicList"
        :key="index"
        @click="playAudio(index)"
      >
        <div class="left">
          <img :src="(music.cover as string) || ''" class="music-cover" />
        </div>
        <div class="right">
          <div class="music-title">{{ music.title }}</div>
          <div class="music-artist">
            {{ music.artist }} - <span class="music-album">{{ music.album }}</span>
          </div>
        </div>
        <audio
          v-if="typeof music.url === 'string'"
          :src="music.url"
          :ref="(el) => setAudioRef(el, index)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
audio {
  display: none;
}
.music-cover {
  width: 130px;
  height: 130px;
}

.music-item {
  .row-flex();
  align-items: center;
  cursor: pointer;
}

.right {
  .col-flex();
}

.right,
.music-item {
  gap: 10px;
}

.music-title {
  font-size: 24px;
}

.isPlaying {
  background-color: @lightMode-music-playingBgColor;
  .music-title {
    color: @lightMode-music-playingTextColor;
    font-weight: 600;
  }
  .music-artist {
    font-weight: 500;
  }
}
</style>

<script lang="ts" setup>
import { ref, type ComponentPublicInstance } from 'vue'
import { parseMusicFile } from '@/utils/musicMeta'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { usePlaylistStore } from '@/stores/playlistStore'

interface WindowWithDirectoryPicker extends Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
}

const loading = ref(false)
const audioRefs = ref<HTMLAudioElement[]>([])
const currentPlayingIndex = ref<number | null>(null)
const playlistStore = usePlaylistStore()
const musicList = useMusicMetaStore().musicList

function setAudioRef(
  el: HTMLAudioElement | Element | ComponentPublicInstance | null,
  index: number,
) {
  if (el instanceof HTMLAudioElement) {
    audioRefs.value[index] = el
  }
}

// 播放音频的方法
async function playAudio(index: number) {
  try {
    if (currentPlayingIndex.value !== null && audioRefs.value[currentPlayingIndex.value]) {
      audioRefs.value[currentPlayingIndex.value].pause()
      audioRefs.value[currentPlayingIndex.value].currentTime = 0
    }

    if (audioRefs.value[index]) {
      await audioRefs.value[index].play()
      currentPlayingIndex.value = index

      if (index < musicList.length) {
        playlistStore.setCurrentPlaying(musicList[index], index)
      }
    }
  } catch (error) {
    console.error('播放音频失败:', error)
    alert('播放音频失败，请检查浏览器设置或尝试其他浏览器')
  }
}

function showError(msg: string, err?: unknown) {
  if (err) console.error(msg, err)
  alert(msg)
}

interface MusicInfo {
  [key: string]: unknown
}

async function handleMusicFile(entry: FileSystemFileHandle) {
  const name = entry.name
  if (!/\.(flac|mp3|wav)$/i.test(name)) return

  try {
    const file = await entry.getFile()
    const musicInfo = (await parseMusicFile(file)) as MusicInfo
    musicInfo.url = URL.createObjectURL(file)
    useMusicMetaStore().addMusic(musicInfo)
  } catch (fileError) {
    showError(`解析文件 ${name} 时出错，请检查文件格式`, fileError)
  }
}

async function pickMusic() {
  const win = window as WindowWithDirectoryPicker
  if (!win.showDirectoryPicker) {
    showError('当前浏览器不支持此功能，请使用最新版本的Chrome、Edge等浏览器')
    return
  }

  loading.value = true
  try {
    const dirHandle = await win.showDirectoryPicker!()
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        await handleMusicFile(entry as FileSystemFileHandle)
      }
    }

    alert('音乐添加完成')
  } catch (err: unknown) {
    if ((err as { name?: string })?.name === 'AbortError') {
      console.log('用户取消了操作')
    } else {
      showError('无法访问文件夹，请确保已授予必要的权限', err)
    }
  } finally {
    loading.value = false
  }
}
</script>
