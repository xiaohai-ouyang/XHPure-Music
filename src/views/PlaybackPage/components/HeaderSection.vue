<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const pageStatusStore = usePageStatusStore()

const isFullScreen = ref(false)

/**
 * 返回上一页并更新页面状态
 */
const back = () => {
  if (isFullScreen.value) {
    document.exitFullscreen()
  }
  isFullScreen.value = false
  pageStatusStore.isPlayBackExpand = false
  router.back()
}

function toggleFullScreen() {
  if (isFullScreen.value) {
    document.exitFullscreen()
  } else {
    document.body.requestFullscreen()
  }
}

function handleFullscreenChange() {
  isFullScreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
  <header>
    <!-- 返回按钮 -->
    <button @click="back" class="back-btn"><icon-ph-arrow-left :size="20" /></button>

    <button class="full-screen-btn" @click="toggleFullScreen">
      <icon-ph-corners-out v-if="isFullScreen" :size="20" />
      <icon-ph-corners-in v-else :size="20" />
    </button>
  </header>
</template>

<style scoped lang="less">
header {
  .row-flex(@justify: space-between,@align: center);
  position: relative;
  height: 6vmin;

  .back-btn,
  .full-screen-btn {
    .row-flex(@justify:center,@align:center);
    padding: 1vmin;
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    height: 4.3vmin;
    width: 4.3vmin;
    border-radius: 1vmin;
    transition: all 0.3s ease;
    color: inherit;
  }
}
</style>
