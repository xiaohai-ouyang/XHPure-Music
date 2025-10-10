<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useLrcParser } from '@/composables/useLrcParser'

const props = defineProps<{
  lyrics: string
  currentTime?: number
  dominantTextColor?: string
  removeChinese?: boolean // 新增：是否去掉中文
}>()

const lyricsContainerRef = ref<HTMLElement | null>(null)

const { parsedLyrics, activeLineIndex, spacerHeight, setLyricLineRef } = useLrcParser(
  toRef(props, 'lyrics'),
  toRef(props, 'currentTime'),
  lyricsContainerRef,
  toRef(props, 'removeChinese'),
)

function isActiveLine(index: number) {
  return index === activeLineIndex.value
}
</script>

<template>
  <div
    class="lrc-parser"
    ref="lyricsContainerRef"
    :style="{ color: dominantTextColor || 'rgba(255,255,255)' }"
  >
    <div v-if="parsedLyrics.length === 0" class="no-lyrics">暂无歌词</div>
    <div v-else class="lyrics-container-wrapper">
      <div class="lyrics-spacer" :style="{ height: spacerHeight + 'px' }"></div>
      <div class="lyrics-container">
        <div
          v-for="(line, index) in parsedLyrics"
          :key="index"
          :class="{ 'lyric-line': true, active: isActiveLine(index) }"
          :ref="(el) => setLyricLineRef(el as Element, index)"
        >
          {{ line.text }}
        </div>
      </div>
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
    font-size: 16px;
    margin-top: 50px;
  }

  .lyrics-container-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .lyrics-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .lyric-line {
    font-size: 18px;
    opacity: 0.5;
    transition: all 0.5s linear;
    &.active {
      opacity: 1;
      font-weight: bold;
      font-size: 25px;
      transform: scale(1.05);
      color: #fff;
    }
  }
}
</style>
