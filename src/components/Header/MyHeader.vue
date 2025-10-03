<template>
  <div class="MyHeader" @click="usePageStatusStore().isPlaylistShow = false">
    <header :style="{ width: usePageStatusStore().pageWidth + 'px' }">
      <button class="toggle-nav-btn" @click="usePageStatusStore().toggleNav">
        <i class="iconfont">&#xe62b;</i>
      </button>
      <h3>{{ usePageStatusStore().currentPageTitle }}</h3>
    </header>
  </div>
</template>
<script setup lang="ts">
import { usePageStatusStore } from '@/stores/pageStatusStores'
</script>

<style lang="less" scoped>
header {
  .row-flex();
  align-items: center;
  padding: 5px 10px;
  position: fixed;
  top: 0;
  z-index: 1000;
  background-color: @lightMode-header-bgColor;

  h3 {
    margin: 0 auto;
  }
}

.toggle-nav-btn {
  width: 30px;
  height: 30px;
  border: none;
  background-color: transparent;
  position: fixed;
  top: 2px;
}

.iconfont {
  font-size: 25px;
}
</style>
