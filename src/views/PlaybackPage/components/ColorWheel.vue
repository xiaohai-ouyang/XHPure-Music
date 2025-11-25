<script setup lang="ts">
import { useDominantColor } from '@/composables/useDominantColor'
import { ref } from 'vue'

const { textColors, selectedColorIndex, selectColor } = useDominantColor()

const colorWheelVisible = ref(false)
const colorWheelTimer = ref<number | null>(null)

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
</script>

<template>
  <div class="color-wheel" @mouseenter="showColorWheel" @mouseleave="hideColorWheel">
    <div
      v-for="(color, index) in textColors"
      :key="index"
      class="color-item"
      :class="{ selected: index === selectedColorIndex }"
      :style="{ background: color }"
      @click="selectColor(index)"
    ></div>
  </div>
</template>

<style scoped lang="less">
.color-wheel {
  .col-flex(@justify: center, @align: center,@gap: 15px);
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  transition: all 0.3s ease;
  z-index: 100;

  .color-item {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .selected {
    transform: scale(1.4);
    border: 1px solid #fff;
    pointer-events: none;
  }
}
</style>
