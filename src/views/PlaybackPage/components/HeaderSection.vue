<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { useDominantColor } from '@/composables/useDominantColor'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const pageStatusStore = usePageStatusStore()
const { textColors, selectedColorIndex, selectColor } = useDominantColor()

const colorWheelVisible = ref(false)
const colorWheelTimer = ref<number | null>(null)
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

function showColorWheel() {
  if (colorWheelTimer.value) {
    clearTimeout(colorWheelTimer.value)
    colorWheelTimer.value = null
  }
  colorWheelVisible.value = true
}

function hideColorWheel() {
  colorWheelTimer.value = window.setTimeout(() => {
    colorWheelVisible.value = false
    colorWheelTimer.value = null
  }, 1000)
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

    <!-- 颜色选择器 -->
    <div
      class="color-wheel"
      :class="{ hide: !colorWheelVisible }"
      @mouseenter="showColorWheel"
      @mouseleave="hideColorWheel"
    >
      <div
        v-for="(color, index) in textColors"
        :key="index"
        class="color-item"
        :class="{ selected: index === selectedColorIndex }"
        :style="{ background: color }"
        @click="selectColor(index)"
      ></div>
    </div>

    <button class="full-screen-btn" @click="toggleFullScreen">
      <i class="iconfont" v-if="isFullScreen">&#xe6e8;</i>
      <i class="iconfont" v-else>&#xe6d9;</i>
    </button>
  </header>
</template>

<style scoped lang="less">
header {
  .row-flex();
  position: relative;
  height: 43px;

  .back-btn,
  .color-wheel,
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

header .color-wheel {
  gap: 15px;
  margin: auto;
  border-radius: 20px;
  transition: all 0.3s ease;

  .color-item {
    @size: 25px;
    width: @size;
    height: @size;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .selected {
    transform: scale(1.4);
    border: 1px solid #fff;
    pointer-events: none;
  }
}

.hide {
  transform: translateY(-35px);
}
</style>
