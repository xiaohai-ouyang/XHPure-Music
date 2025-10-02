<template>
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
  scrollbar-width: none;
  -webkit-scrollbar: none;

  ::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
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
</style>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from './stores/themeStore'
import { useGlobalShortcutKey } from './composable/globalShortcutKey'
useGlobalShortcutKey()
document.title = '椒盐音乐'

onMounted(() => {
  useThemeStore().initTheme()
})
</script>
