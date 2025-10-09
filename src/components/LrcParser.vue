<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'

interface LyricLine {
  time: number
  text: string
}

const props = defineProps<{
  lyrics: string
  currentTime?: number
}>()

// 歌词容器引用
const lyricsContainerRef = ref<HTMLElement | null>(null)
// 歌词行引用列表
const lyricLineRefs = ref<HTMLElement[]>([])
// 底部占位高度
const spacerHeight = ref(250)

// 解析后的歌词数组
const parsedLyrics = ref<LyricLine[]>([])

// 设置歌词行引用
function setLyricLineRef(el: Element | null, index: number) {
  if (el) {
    lyricLineRefs.value[index] = el as HTMLElement
  }
}

// 解析歌词
function parseLyrics(lyrics: string) {
  if (!lyrics) {
    parsedLyrics.value = []
    return
  }

  const lines = lyrics.split('\n')
  const lyricLines: LyricLine[] = []

  for (const line of lines) {
    // 匹配时间标签 [mm:ss.xx] 或 [mm:ss]
    const timeMatch = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\]/)
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10)
      const seconds = parseInt(timeMatch[2], 10)
      const milliseconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0

      // 计算总时间（秒）
      const time = minutes * 60 + seconds + milliseconds / 1000

      // 提取歌词文本（时间标签之后的内容）
      const text = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim()

      lyricLines.push({ time, text })
    }
  }

  // 按时间排序
  lyricLines.sort((a, b) => a.time - b.time)
  parsedLyrics.value = lyricLines
}

// 当前活跃的歌词行索引
const activeLineIndex = computed(() => {
  if (!props.currentTime || parsedLyrics.value.length === 0) {
    return -1
  }

  // 找到当前时间对应的歌词行（从后往前找第一个 ≤ 当前时间的）
  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (parsedLyrics.value[i].time <= (props.currentTime || 0)) {
      return i
    }
  }

  return -1
})

// 判断是否为当前活跃行
function isActiveLine(index: number) {
  return index === activeLineIndex.value
}

// 滚动到当前播放的歌词行（居中）
function scrollToActiveLine() {
  nextTick(() => {
    if (
      activeLineIndex.value < 0 ||
      !lyricsContainerRef.value ||
      !lyricLineRefs.value[activeLineIndex.value]
    ) {
      return
    }

    const container = lyricsContainerRef.value
    const activeLine = lyricLineRefs.value[activeLineIndex.value]
    const containerHeight = container.clientHeight
    const activeLineHeight = activeLine.offsetHeight
    const activeLineTop = activeLine.offsetTop

    // 标准居中公式
    const scrollPosition = activeLineTop - containerHeight / 2 + activeLineHeight / 2

    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    })
  })
}

// 监听当前时间变化，滚动到对应歌词
watch(
  () => activeLineIndex.value,
  () => {
    scrollToActiveLine()
  },
)

// 监听歌词变化，重新解析并更新占位高度
watch(
  () => props.lyrics,
  () => {
    parseLyrics(props.lyrics)
    updateSpacerHeight()
  },
  { immediate: true },
)

// 更新底部占位高度（应约为容器可视高度的一半）
function updateSpacerHeight() {
  nextTick(() => {
    if (lyricsContainerRef.value) {
      spacerHeight.value = lyricsContainerRef.value.clientHeight / 2
    }
  })
}

// 组件挂载后更新占位高度
onMounted(updateSpacerHeight)
</script>

<template>
  <div class="lrc-parser" ref="lyricsContainerRef">
    <div v-if="parsedLyrics.length === 0" class="no-lyrics">暂无歌词</div>
    <div v-else class="lyrics-container-wrapper">
      <!-- 顶部占位：确保第一行也能居中 -->
      <div class="lyrics-spacer" :style="{ height: spacerHeight + 'px' }"></div>

      <!-- 歌词内容 -->
      <div class="lyrics-container">
        <div
          v-for="(line, index) in parsedLyrics"
          :key="index"
          :class="{ 'lyric-line': true, active: isActiveLine(index) }"
          :ref="(el) => setLyricLineRef(el, index)"
        >
          {{ line.text }}
        </div>
      </div>

      <!-- 底部占位：确保最后一行也能居中 -->
      <div class="lyrics-spacer" :style="{ height: spacerHeight + 'px' }"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.lrc-parser {
  height: 500px;
  width: 100%;
  overflow-y: auto; // 支持滚动到底部
  padding: 20px;
  box-sizing: border-box;
  scroll-behavior: smooth; // 平滑滚动（可选，替代 JS behavior）
  position: relative;

  // 隐藏滚动条（可选，美观用）
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  .no-lyrics {
    text-align: center;
    color: #999;
    font-size: 16px;
    margin-top: 50px;
  }

  .lyrics-container-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100%; // 确保内容少时也能撑开
  }

  .lyrics-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 10px;
  }

  .lyric-line {
    font-size: 18px;
    color: #aca8a8;
    transition: all 0.5s linear;
    text-align: center;
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.active {
      color: #003cff;
      font-size: 25px;
      font-weight: bold;
      transform: scale(1.05);
    }
  }

  .lyrics-spacer {
    // 动态高度，由 JS 控制
    flex-shrink: 0;
  }
}
</style>
