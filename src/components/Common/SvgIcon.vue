<script setup lang="ts">
import { computed } from 'vue'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number

interface Props {
  /**
   * 图标尺寸
   * - 预定义尺寸：xs(16px), sm(20px), md(24px), lg(28px), xl(32px), xxl(40px)
   * - 自定义尺寸：直接传入数字（单位：px）
   * @default 'md'
   */
  size?: IconSize
  /**
   * 额外的 CSS 类名
   */
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  className: '',
})

/**
 * 预定义尺寸映射表（像素值）
 */
const sizeMap: Record<string, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 40,
}

/**
 * 计算图标尺寸
 */
const iconSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }
  return sizeMap[props.size] || sizeMap.md
})

/**
 * 计算组件类名
 */
const computedClass = computed(() => {
  const baseClasses = ['svg-icon-wrapper']
  if (props.className) {
    baseClasses.push(props.className)
  }
  return baseClasses.join(' ')
})
</script>

<template>
  <span :class="computedClass" :style="{ width: iconSize + 'px', height: iconSize + 'px' }">
    <slot :size="iconSize" />
  </span>
</template>

<style scoped lang="less">
.svg-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-shrink: 0;

  :deep(svg) {
    width: 100%;
    height: 100%;
    vertical-align: middle;
  }
}
</style>
