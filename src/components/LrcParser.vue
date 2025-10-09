<template>
  <div class="lrc-parser">
    <div v-if="parsedLyrics.length === 0" class="no-lyrics">暂无歌词</div>
    <div v-else class="lyrics-container">
      <div
        v-for="(line, index) in parsedLyrics"
        :key="index"
        :class="{ 'lyric-line': true, active: isActiveLine(index) }"
      >
        {{ line.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface LyricLine {
  time: number
  text: string
}

const props = defineProps<{
  lyrics: string
  currentTime?: number
}>()

// 解析后的歌词数组
const parsedLyrics = ref<LyricLine[]>([])

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

  // 找到当前时间对应的歌词行
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

// 监听歌词变化，重新解析
watch(
  () => props.lyrics,
  (newLyrics) => {
    parseLyrics(newLyrics)
  },
  { immediate: true },
)
</script>

<style scoped lang="less">
.lrc-parser {
  height: 100%;
  overflow-y: auto;
  padding: 20px;

  .no-lyrics {
    text-align: center;
    color: #999;
    font-size: 16px;
    margin-top: 50px;
  }

  .lyrics-container {
    text-align: center;

    .lyric-line {
      margin: 10px 0;
      padding: 5px 0;
      font-size: 16px;
      color: #666;
      transition: all 0.3s ease;

      &.active {
        color: #fff;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }
}
</style>
