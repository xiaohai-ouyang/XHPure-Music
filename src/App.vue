<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useThemeStore } from './stores/themeStore'
import { useGlobalShortcutKey } from './composables/useGlobalShortcutKey'
import { useplaybackQueueStore } from './stores/playbackQueueStores'

// --------- 初始化全局状态 ---------
const playbackQueueStore = useplaybackQueueStore()
const audioRef = ref<HTMLAudioElement | null>(null)

// 页面标题与快捷键
document.title = '椒盐音乐'
useGlobalShortcutKey()

// 初始化主题
onMounted(() => {
  useThemeStore().initTheme()
})

// --------- 监听歌曲变化，自动播放 ---------
watch(
  () => playbackQueueStore.currentPlaying,
  async (newSong) => {
    const audio = audioRef.value
    if (!audio) return

    try {
      audio.pause()

      // 没有歌曲或没有 URL，直接退出
      if (!newSong?.url) return

      // 设置音频源并加载
      audio.src = newSong.url
      audio.load()

      // 等待音频可播放后再调用 play()
      audio.addEventListener(
        'canplay',
        () => {
          audio.play().catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('播放音频时出错:', err)
            }
          })
        },
        { once: true }
      )
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('播放音频时出错:', error)
      }
    }
  }
)

// --------- 事件处理函数 ---------
const handleTimeUpdate = () => playbackQueueStore.updateCurrentPlayingTime()
const handlePlay = () => (playbackQueueStore.isPlaying = true)
const handlePause = () => (playbackQueueStore.isPlaying = false)

// 处理播放结束
const handleEnded = () => {
  const audio = audioRef.value
  if (!audio) return

  if (playbackQueueStore.playMode === 'loop' && playbackQueueStore.currentPlaying) {
    audio.currentTime = 0
    audio.play().catch(console.error)
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
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 9999;

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
  }
}
</style>
