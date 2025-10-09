<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useThemeStore } from './stores/themeStore'
import { useGlobalShortcutKey } from './composable/globalShortcutKey'
import { usePlaylistStore } from './stores/playlistStore'

const playlistStore = usePlaylistStore()
const audioRef = ref<HTMLAudioElement | null>(null)

document.title = '椒盐音乐'
useGlobalShortcutKey()
onMounted(() => {
  useThemeStore().initTheme()
})

watch(
  () => playlistStore.currentPlaying,
  async () => {
    if (!audioRef.value) return

    try {
      if (!playlistStore.currentPlaying) {
        return
      }

      const musicUrl = playlistStore.currentPlaying.url
      if (!musicUrl) {
        return
      }

      audioRef.value.src = musicUrl
      await audioRef.value.play()
    } catch (error) {
      console.error('播放音频时出错:', error)
    }
  },
)
</script>

<template>
  <audio
    ref="audioRef"
    @play="playlistStore.isPlaying = true"
    @pause="playlistStore.isPlaying = false"
    @ended="playlistStore.playNext"
  />
  <router-view></router-view>
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
}

@font-face {
  font-family: MiSans;
  src: url(./assets/fonts/MiSans.ttf);
}

body {
  font-family: MiSans;
}

@font-face {
  font-family: 'iconfont';
  src:
    url('./assets/iconfont/iconfont.woff2') format('woff2'),
    url('./assets/iconfont/iconfont.woff') format('woff'),
    url('./assets/iconfont/iconfont.ttf') format('truetype');
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
</style>
