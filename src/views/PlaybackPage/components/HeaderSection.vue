<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePageStatusStore } from '@/stores/pageStatusStores'
import { useDominantColor } from '@/composables/useDominantColor'

const router = useRouter()
const pageStatusStore = usePageStatusStore()
const { textColors, selectedColorIndex, selectColor } = useDominantColor()

/**
 * 返回上一页并更新页面状态
 */
const back = () => {
  pageStatusStore.isPlayBackExpand = false
  router.back()
}
</script>

<template>
  <header>
    <!-- 返回按钮 -->
    <button @click="back" class="back-btn"><i class="iconfont">&#xe79c;</i></button>

    <!-- 颜色选择器 -->
    <div class="color-wheel">
      <div
        v-for="(color, index) in textColors"
        :key="index"
        class="color-item"
        :class="{ selected: index === selectedColorIndex }"
        :style="{ background: color }"
        @click="selectColor(index)"
      ></div>
    </div>
  </header>
</template>

<style scoped lang="less">
header {
  .row-flex();
  position: relative;
  height: 43px;

  .back-btn,
  .color-wheel {
    .row-flex(@justify:center,@align:center);
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
}

header .back-btn {
  position: absolute;
  left: 0;
  top: 0;
  height: 43px;
  width: 43px;
  border-radius: 10px;
  transition: all 0.3s ease;

  .iconfont {
    font-size: 28px;
  }
  
  &,
  .iconfont {
    color: inherit;
  }
}

header .color-wheel {
  gap: 15px;
  position: relative;
  margin: auto;
  border-radius: 20px;

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
</style>
