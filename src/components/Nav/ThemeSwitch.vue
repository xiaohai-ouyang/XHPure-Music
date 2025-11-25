<template>
  <div class="color-mode-switch">
    <button
      class="dark-mode"
      :class="{ active: themeStore.colorMode === 'dark' }"
      title="暗色模式"
      @click="themeStore.setColorMode('dark')"
    >
      <i class="iconfont">&#xe620;</i>
    </button>

    <button
      class="follow-system"
      :class="{ active: themeStore.colorMode === 'system' }"
      title="跟随系统"
      @click="themeStore.setColorMode('system')"
    >
      <i class="iconfont">&#xe799;</i>
    </button>

    <button
      class="light-mode"
      :class="{ active: themeStore.colorMode === 'light' }"
      title="亮色模式"
      @click="themeStore.setColorMode('light')"
    >
      <i class="iconfont">&#xe61b;</i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>

<style scoped lang="less">
.color-mode-switch {
  .row-flex(@justify: space-evenly, @align: center);
  width: 100%;
  padding: 5px;
  background-color: white;
  border-radius: @nav-borderRadius;

  i {
    font-size: 25px;
  }

  button {
    .row-flex(@justify: center, @align: center);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
  }
}

.active {
  color: @lightMode-nav-activeColor;
}
</style>
