<script setup lang="ts">
import tinyColor from 'tinycolor2'
import { ref, toRef, computed } from 'vue'
import { useLrcParser } from '@/composables/useLrcParser'
import { useDominantColor } from '@/composables/useDominantColor'

/**
 * 歌词解析和显示组件的属性定义
 * @prop lyrics 歌词文本内容
 * @prop currentTime 当前播放时间（可选）
 * @prop removeChinese 是否移除中文字符（可选）
 */
const props = defineProps<{
  lyrics: string
  currentTime?: number
  removeChinese?: boolean
}>()

const lyricsContainerRef = ref<HTMLElement | null>(null)

/**
 * 使用歌词解析组合式函数处理歌词数据
 * @param toRef(props, 'lyrics') 响应式的歌词文本
 * @param toRef(props, 'currentTime') 响应式的当前播放时间
 * @param lyricsContainerRef 歌词容器引用
 * @param toRef(props, 'removeChinese') 响应式的是否移除中文标记
 */
const { parsedLyrics, activeLineIndex, spacerHeight, setLyricLineRef } = useLrcParser(
  toRef(props, 'lyrics'),
  toRef(props, 'currentTime'),
  lyricsContainerRef,
  toRef(props, 'removeChinese'),
)

const { textColors, currentTextColor } = useDominantColor()

/**
 * 计算有效的文本颜色
 * 优先级：当前文本颜色 > 主色调颜色 > 默认白色
 */
const effectiveColor = computed(
  () => currentTextColor.value || (textColors.value && textColors.value[0]) || 'rgba(255,255,255)',
)

/**
 * 非激活行使用更暗、更透明的颜色
 */
const inactiveColor = computed(() => {
  try {
    const rgb = tinyColor(effectiveColor.value).toRgb()
    return `rgba(${rgb.r},${rgb.g},${rgb.b},0.6)`
  } catch {
    return 'rgba(255,255,255,0.6)'
  }
})

/**
 * 判断指定索引是否为当前活动行
 * @param index 行索引
 * @returns boolean 是否为活动行
 */
function isActiveLine(index: number) {
  return index === activeLineIndex.value
}
</script>

<template>
  <div class="lrc-parser" ref="lyricsContainerRef" :style="{ color: effectiveColor }">
    <div class="lyrics-container-wrapper">
      <!-- 上方间隔元素，用于居中歌词 -->
      <div class="lyrics-spacer" :style="{ height: spacerHeight + 'px' }"></div>
      <div class="lyrics-container">
        <!-- 遍历渲染每行歌词 -->
        <div
          v-for="(line, index) in parsedLyrics"
          :key="index"
          :class="{ 'lyric-line': true, active: isActiveLine(index) }"
          :style="isActiveLine(index) ? { color: effectiveColor } : { color: inactiveColor }"
          :ref="(el) => setLyricLineRef(el as Element, index)"
        >
          <template v-if="line.translation && !removeChinese">
            <div class="lyric-original">{{ line.originalText }}</div>
            <div class="lyric-translation">{{ line.translation }}</div>
          </template>
          <template v-else>
            {{ line.displayText }}
          </template>
        </div>
      </div>
      <!-- 下方间隔元素，用于居中歌词 -->
      <div class="lyrics-spacer" :style="{ height: spacerHeight + 'px' }"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.lrc-parser {
  height: 50vmin;
  width: 100%;
  overflow-y: auto;
  padding: 2vmin;
  scroll-behavior: smooth;
  position: relative;

  &::-webkit-scrollbar {
    display: none;
  }

  .lyrics-container-wrapper,
  .lyrics-container {
    .col-flex(@align: center);
  }

  .lyrics-container {
    gap: 1vmin;
    width: 100%;
  }

  .lyric-line {
    max-width: calc(100% - 7vmin);
    white-space: wrap;
    text-align: center;
    font-size: 2.5vmin;
    opacity: 0.5;
    transition:
      color 0.3s ease,
      font-size 0.5s ease,
      opacity 0.5s linear,
      transform 0.5s cubic-bezier(0.65, 0.05, 0.36, 1),
      font-weight 0.5s linear;

    .lyric-translation {
      font-size: 0.8em;
      opacity: 0.8;
    }

    &.active {
      opacity: 1;
      font-weight: 700;
      font-size: 2.8vmin;
      transform: scale(1.06);
      color: inherit;

      .lyric-translation {
        opacity: 0.9;
      }
    }
  }
}
</style>
