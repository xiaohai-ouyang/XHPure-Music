<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'

interface LyricLine {
  time: number
  text: string
}

const props = defineProps<{
  lyrics: string
  currentTime?: number
  dominantTextColor?: string
}>()

const lyricsContainerRef = ref<HTMLElement | null>(null)
const lyricLineRefs = ref<HTMLElement[]>([])
const spacerHeight = ref(250)
const parsedLyrics = ref<LyricLine[]>([])
function setLyricLineRef(el: Element | null, index: number) {
  if (el) {
    lyricLineRefs.value[index] = el as HTMLElement
  }
}

function parseLyrics(lyrics: string) {
  if (!lyrics) {
    parsedLyrics.value = []
    return
  }

  const lines = lyrics.split('\n')
  const lyricLines: LyricLine[] = []

  for (const line of lines) {
    const timeMatch = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\]/)
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10)
      const seconds = parseInt(timeMatch[2], 10)
      const milliseconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim()
      lyricLines.push({ time, text })
    }
  }

  lyricLines.sort((a, b) => a.time - b.time)
  parsedLyrics.value = lyricLines
}

const activeLineIndex = computed(() => {
  if (!props.currentTime || parsedLyrics.value.length === 0) {
    return -1
  }

  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (parsedLyrics.value[i].time <= (props.currentTime || 0)) {
      return i
    }
  }

  return -1
})

function isActiveLine(index: number) {
  return index === activeLineIndex.value
}

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
    const scrollPosition = activeLineTop - containerHeight / 2 + activeLineHeight / 2

    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    })
  })
}

watch(
  () => activeLineIndex.value,
  () => {
    scrollToActiveLine()
  },
)

watch(
  () => props.lyrics,
  () => {
    parseLyrics(props.lyrics)
    updateSpacerHeight()
  },
  { immediate: true },
)

function updateSpacerHeight() {
  nextTick(() => {
    if (lyricsContainerRef.value) {
      spacerHeight.value = lyricsContainerRef.value.clientHeight / 2
    }
  })
}

onMounted(updateSpacerHeight)
</script>

<template>
  <div
    class="lrc-parser"
    ref="lyricsContainerRef"
    :style="{ color: dominantTextColor || 'rgba(255, 255, 255)' }"
  >
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
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  position: relative;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  .no-lyrics {
    text-align: center;

    font-size: 16px;
    margin-top: 50px;
  }

  .lyrics-container-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100%;
  }

  .lyrics-container {
    .col-flex(center);
    width: 100%;
    gap: 10px;
  }

  .lyric-line {
    font-size: 18px;
    transition: all 0.5s linear;
    text-align: center;
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.5;

    &.active {
      color: #fff;
      font-size: 25px;
      font-weight: bold;
      transform: scale(1.05);
      opacity: 1;
    }
  }

  .lyrics-spacer {
    flex-shrink: 0;
  }
}
</style>
