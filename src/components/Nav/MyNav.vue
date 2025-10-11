<template>
  <div
    class="myNav"
    :class="{ myNavContracted: usePageStatusStore().isNavContracted }"
    @click="usePageStatusStore().isPlaylistShow = false"
  >
    <nav>
      <div class="color-mode-switch">
        <button
          class="dark-mode"
          :class="{ active: useThemeStore().colorMode === 'dark' }"
          title="暗色模式"
          @click="useThemeStore().setColorMode('dark')"
        >
          <i class="iconfont">&#xe620;</i>
        </button>

        <button
          class="floow-system"
          :class="{ active: useThemeStore().colorMode === 'system' }"
          title="跟随系统"
          @click="useThemeStore().setColorMode('system')"
        >
          <i class="iconfont">&#xe799;</i>
        </button>

        <button
          class="light-mode"
          :class="{ active: useThemeStore().colorMode === 'light' }"
          title="亮色模式"
          @click="useThemeStore().setColorMode('light')"
        >
          <i class="iconfont">&#xe61b;</i>
        </button>
      </div>

      <div class="navItem-container">
        <router-link
          class="nav-item"
          :class="{ active: pageStatusStore.currentPageTitle === '歌曲' }"
          to="/page/music"
        >
          <i class="iconfont">&#xe725;</i>
          <p class="nav-item-name">歌曲</p>
        </router-link>
        <router-link
          class="nav-item"
          :class="{ active: pageStatusStore.currentPageTitle === '专辑' }"
          to="/page/albums"
        >
          <i class="iconfont">&#xe717;</i>
          <p class="nav-item-name">专辑</p>
        </router-link>
        <router-link
          class="nav-item"
          :class="{ active: pageStatusStore.currentPageTitle === '艺术家' }"
          to="/page/artists"
        >
          <i class="iconfont">&#xe71d;</i>
          <p class="nav-item-name">艺术家</p>
        </router-link>
        <router-link
          class="nav-item"
          :class="{ active: pageStatusStore.currentPageTitle === '文件夹' }"
          to="/page/folders"
        >
          <i class="iconfont">&#xe72c;</i>
          <p class="nav-item-name">文件夹</p>
        </router-link>
        <router-link
          class="nav-item"
          :class="{ active: pageStatusStore.currentPageTitle === '歌单' }"
          to="/page/playlists"
        >
          <i class="iconfont">&#xe71f;</i>
          <p class="nav-item-name">歌单</p>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { useThemeStore } from '@/stores/themeStore'
const pageStatusStore = usePageStatusStore()
</script>

<style scoped lang="less">
.active {
  color: @lightMode-nav-activeColor !important;
}

.myNav {
  width: 200px;
  transition: width 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.1);
  background: @lightMode-nav-bgColor;
}

nav {
  .col-flex();
  padding: 20px 10px;
  height: 100vh;
  width: 200px;
  // min-height: 560px;
}

.color-mode-switch {
  .row-flex(@justify: space-evenly, @align: center);
  width: 100%;
  padding: 5px;

  i {
    font-size: 25px;
  }

  button {
    .row-flex(@justify: center, @align: center);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    background: transparent;
    cursor: pointer;
  }
}

.navItem-container {
  margin-top: 20px;
  width: 100%;
  padding: 2px;
}

.nav-item {
  .row-flex(@justify: flex-start, @align: center);
  height: 40px;
  color: initial;
  text-decoration: none;
  font-weight: 500;
  padding: 5px 25px 5px 30px;
  width: 100%;
  gap: 30px;
  transition: all 0.2s;
  border-radius: @nav-borderRadius;

  &:hover {
    background: @lightMode-nav-hoverColor;
  }
}

.nav-item-name {
  white-space: nowrap;
}

.iconfont {
  font-size: 35px;
}

.myNavContracted {
  width: 0;
}

.color-mode-switch,
.navItem-container {
  background: @lightMode-nav-bgItemColor;
  border-radius: @nav-borderRadius;
}
</style>
