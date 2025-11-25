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
    <button @click="back" class="back-btn"><i class="iconfont">&#xe79c;</i></button>

    <button class="full-screen-btn" @click="toggleFullScreen">
      <i class="iconfont" v-if="isFullScreen">&#xe6e8;</i>
      <i class="iconfont" v-else>&#xe6d9;</i>
    </button>
  </header>
</template>

<style scoped lang="less">
header {
  .row-flex(@justify: space-between,@align: center);
  position: relative;

  .back-btn,
  .full-screen-btn {
    .row-flex(@justify:center,@align:center);
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
}

header .back-btn,
header .full-screen-btn {
  height: 43px;
  width: 43px;
  border-radius: 10px;
  transition: all 0.3s ease;

  .iconfont {
    font-size: 25px;
  }

  &,
  .iconfont {
    color: inherit;
  }
}
</style>
