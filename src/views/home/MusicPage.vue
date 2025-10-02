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
        @click="handleMusicClick(music)"
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

.music-item-box {
  .col-flex();
  gap: 5px;
}

.music-item {
  .row-flex();
  align-items: center;
  cursor: pointer;
  position: relative;
}

.left {
  height: 130px;
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

.actions {
  position: absolute;
  right: 10px;
  top: 10px;
}

.add-to-playlist-btn {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>

<script lang="ts" setup>
import { ref } from 'vue'
import { parseMusicFile } from '@/utils/musicMeta'
import { useMusicMetaStore } from '@/stores/musicMetaStores'
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()

interface WindowWithDirectoryPicker extends Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
}

const loading = ref(false)
const currentPlayingIndex = ref<number | null>(null)

function handleMusicClick(music: MusicInfo) {
  playlistStore.addToPlaylist(music)
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
