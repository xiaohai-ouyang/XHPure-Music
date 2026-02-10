<template>
  <div class="MyHeader" @click="pageStatusStore.isPlayQueueShow = false">
    <header :style="{ width: pageStatusStore.pageWidth + 'px' }">
      <button class="toggle-nav-btn" @click="pageStatusStore.toggleNav">
        <icon-ph-list :size="24" />
      </button>
      <h3>{{ usePageStatusStore().currentPageTitle }}</h3>
    </header>
  </div>
</template>
<script setup lang="ts">
import { usePageStatusStore } from '@/stores/pageStatusStores'

const pageStatusStore = usePageStatusStore()
</script>

<style lang="less" scoped>
header {
  .row-flex(@align: center);
  padding: 5px 10px;
  position: fixed;
  top: 0;
  z-index: 5;
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
</style>
