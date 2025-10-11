<script setup lang="ts">
import { ref, toRef, computed, watch, onMounted, nextTick } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'
import tinycolor from 'tinycolor2'
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

const playlistStore = usePlaylistStore()

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

/**
 * 监听活动行索引变化，同步到播放列表存储
 */
watch(activeLineIndex, (val) => {
  playlistStore.setLyricActiveLineIndex(val)
})

/**
 * 同步滚动位置到 playlistStore
 */
function syncScrollTop() {
  if (lyricsContainerRef.value) {
    playlistStore.setLyricScrollTop(lyricsContainerRef.value.scrollTop)
  }
}

/**
 * 组件挂载后恢复之前保存的滚动位置
 */
onMounted(() => {
  nextTick(() => {
    // 恢复滚动位置
    if (lyricsContainerRef.value && playlistStore.lyricScrollTop > 0) {
      lyricsContainerRef.value.scrollTop = playlistStore.lyricScrollTop
    }
  })
})

/**
 * 监听滚动事件，实时同步滚动位置
 */
watch(
  lyricsContainerRef,
  (el) => {
    if (el) {
      el.addEventListener('scroll', syncScrollTop)
    }
  },
  { immediate: true },
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
    const rgb = tinycolor(effectiveColor.value).toRgb()
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
    <!-- 当没有歌词时显示提示 -->
    <div v-if="parsedLyrics.length === 0" class="no-lyrics">暂无歌词</div>
    <div v-else class="lyrics-container-wrapper">
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
          {{ line.displayText }}
        </div>
      </div>
      <!-- 下方间隔元素，用于居中歌词 -->
      <div class="lyrics-spacer" :style="{ height: spacerHeight + 'px' }"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.lrc-parser {
  height: 500px;
  width: 100%;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  position: relative;

  &::-webkit-scrollbar {
    display: none;
  }

  .no-lyrics {
    text-align: center;
    font-size: 26px;
  }

  .lyrics-container-wrapper,
  .lyrics-container {
    .col-flex(@align: center);
  }

  .lyrics-container {
    gap: 10px;
    width: 100%;
  }

  .lyric-line {
    font-size: 18px;
    opacity: 0.5;
    transition: all 0.5s linear;

    &.active {
      opacity: 1;
      font-weight: 700;
      font-size: 25px;
      transform: scale(1.06);
      color: inherit;
    }
  }
}
</style>
