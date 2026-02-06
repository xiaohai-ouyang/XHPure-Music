<script setup lang="ts">
import { computed } from 'vue'
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()

const iconMap = {
  success: '✓',
  warning: '!',
  error: '✕',
  info: 'i',
}

const bgColorMap = {
  success: '#67c23a',
  warning: '#e6a23c',
  error: '#f56c6c',
  info: '#909399',
}

const currentToast = computed(() => toastStore.currentToast)
const show = computed(() => toastStore.visible)
</script>

<template>
  <Transition name="toast">
    <div
      v-if="show && currentToast"
      class="toast-container"
      :style="{ backgroundColor: bgColorMap[currentToast.type] }"
    >
      <span class="toast-icon">{{ iconMap[currentToast.type] }}</span>
      <span class="toast-message">{{ currentToast.message }}</span>
      <button class="toast-close" @click="toastStore.hideToast">×</button>
    </div>
  </Transition>
</template>

<style scoped lang="less">
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-width: 400px;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
  font-size: 12px;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

// 动画
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
