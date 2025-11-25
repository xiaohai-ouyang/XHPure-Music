<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue'
import { useThemeStore } from './stores/themeStore'
import { useGlobalShortcutKey } from './composables/useGlobalShortcutKey'
import { usePlaybackQueueStore } from './stores/playbackQueueStores'
import { ElMessage } from 'element-plus'
import { useMessageStore } from './stores/messageStore'
const messageStore = useMessageStore()

const playbackQueueStore = usePlaybackQueueStore()
const audioEl = useTemplateRef('audioRef')

// 页面标题与快捷键
document.title = 'XHPureMusic'
useGlobalShortcutKey()

// 初始化主题
onMounted(() => {
  useThemeStore().initTheme()
})

watch(
  () => playbackQueueStore.currentPlaying,
  async (newSong) => {
    if (!audioEl.value) return

    try {
      audioEl.value?.pause()

      // 没有歌曲或没有 URL，直接退出
      if (!newSong?.url) return

      // 设置音频源并加载
      audioEl.value.src = newSong.url
      audioEl.value.load()

      // 等待音频可播放后再调用 play()
      audioEl.value.addEventListener(
        'canplay',
        () => {
          audioEl.value?.play().catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('播放音频时出错:', err)
              messageStore.showError('播放音频时出错: ' + err.message)
            }
          })
        },
        { once: true },
      )
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('播放音频时出错:', error)
        messageStore.showError('播放音频时出错: ' + error.message)
      }
    }
  },
)

watch(
  () => messageStore.lastMessage,
  (message) => {
    if (message) {
      ElMessage({
        showClose: true,
        message: message.content,
        type: message.type,
        duration: 4000,
      })
      messageStore.clearMessage()
    }
  },
)

const handleTimeUpdate = () => {
  if (audioEl.value) {
    playbackQueueStore.updateCurrentPlayingTime(audioEl.value.currentTime, audioEl.value.duration)
  }
}
const handlePlay = () => (playbackQueueStore.isPlaying = true)
const handlePause = () => (playbackQueueStore.isPlaying = false)

const handleEnded = () => {
  if (!audioEl.value) return

  if (playbackQueueStore.playMode === 'loop' && playbackQueueStore.currentPlaying) {
    audioEl.value.currentTime = 0
    audioEl.value.play().catch((err) => {
      messageStore.showError('播放音频时出错: ' + err.message)
      console.error(err)
    })
  } else {
    playbackQueueStore.playNext(true)
  }
}
</script>

<template>
  <!-- 全局唯一音频播放器 -->
  <audio
    ref="audioRef"
    preload="auto"
    @timeupdate="handleTimeUpdate"
    @play="handlePlay"
    @pause="handlePause"
    @ended="handleEnded"
  ></audio>

  <!-- 页面主体 -->
  <router-view />
</template>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

button {
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  .row-flex(@align: center, @justify: center);
}

body {
  font-family: 'MiSans', sans-serif;
  font-weight: 400;
}

.iconfont {
  font-family: 'iconfont' !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mask-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: @lightMode-overlay-bg;
  z-index: 9999;

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: @lightMode-text-on-primary;
  }
}
</style>
