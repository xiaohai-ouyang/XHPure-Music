<script setup lang="ts">
import { ref, onMounted, nextTick, watch, type PropType } from 'vue'
import { Vue3Marquee } from 'vue3-marquee'

/**
 * 智能自动滚动组件
 * - 仅在内容超出容器时启动 vue3-marquee 动画
 * - 支持 hover 暂停、反向、垂直方向、渐变遮罩等
 */

const props = defineProps({
  /** 滚动持续时间（秒） */
  duration: { type: Number, default: 20 },

  /** 鼠标悬停是否暂停 */
  pauseOnHover: { type: Boolean, default: true },

  /** 滚动方向：normal | reverse */
  direction: {
    type: String as PropType<'normal' | 'reverse'>,
    default: 'normal',
  },

  /** 是否垂直滚动（默认水平） */
  vertical: { type: Boolean, default: false },

  /** 是否显示渐变遮罩 */
  gradient: { type: Boolean, default: false },

  /** 渐变宽度 */
  gradientWidth: { type: String, default: '60px' },

  /** 显示的文本 */
  text: { type: String, default: '' },

  /** 是否强制滚动（忽略溢出检测） */
  force: { type: Boolean, default: false },
})

const containerRef = ref<HTMLElement>()
const overflow = ref(false)

/** 检测是否溢出 */
const checkOverflow = async () => {
  await nextTick()
  const el = containerRef.value
  if (!el) return

  if (props.vertical) {
    // 垂直检测高度
    const newOverflow = props.force || el.scrollHeight > el.clientHeight + 2
    // 只有当溢出状态真正改变时才更新
    if (newOverflow !== overflow.value) {
      overflow.value = newOverflow
    }
  } else {
    // 水平检测宽度
    const newOverflow = props.force || el.scrollWidth > el.clientWidth + 2
    // 只有当溢出状态真正改变时才更新
    if (newOverflow !== overflow.value) {
      overflow.value = newOverflow
    }
  }
}

onMounted(() => {
  checkOverflow()
  window.addEventListener('resize', checkOverflow)
})

// 优化监听器，避免不必要的重复计算
watch(
  () => [props.text, props.force],
  () => checkOverflow(),
)
</script>

<template>
  <div ref="containerRef" class="smart-marquee">
    <!-- 超出则滚动 -->
    <Vue3Marquee
      v-if="overflow"
      :duration="duration"
      :pause-on-hover="pauseOnHover"
      :direction="direction"
      :vertical="vertical"
      :gradient="gradient"
      :gradient-width="gradientWidth"
      class="smart-marquee-content"
    >
      <slot>{{ text }}</slot>
    </Vue3Marquee>

    <!-- 否则静态显示 -->
    <div v-else class="smart-marquee-static">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<style scoped lang="less">
.smart-marquee {
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
  z-index: 0;
}

.smart-marquee-content,
.smart-marquee-static {
  display: inline-block;
  vertical-align: middle;
}
</style>
