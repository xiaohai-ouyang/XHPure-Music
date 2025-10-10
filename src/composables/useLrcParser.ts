import { ref, computed, watch, nextTick, onMounted, type Ref } from 'vue'

export interface LyricLine {
  time: number
  text: string
}

export function useLrcParser(
  lyrics: Ref<string>,
  currentTime: Ref<number | undefined>,
  containerRef: Ref<HTMLElement | null>,
) {
  const lyricLineRefs = ref<HTMLElement[]>([])
  const spacerHeight = ref(250)
  const parsedLyrics = ref<LyricLine[]>([])

  function setLyricLineRef(el: Element | null, index: number) {
    if (el) lyricLineRefs.value[index] = el as HTMLElement
  }

  function parseLyrics(text: string) {
    if (!text) {
      parsedLyrics.value = []
      return
    }
    const lines = text.split('\n')
    const lyricLines: LyricLine[] = []
    for (const line of lines) {
      const timeMatch = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\]/)
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1])
        const seconds = parseInt(timeMatch[2])
        const milliseconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0
        const time = minutes * 60 + seconds + milliseconds / 1000
        const lyricText = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim()
        lyricLines.push({ time, text: lyricText })
      }
    }
    lyricLines.sort((a, b) => a.time - b.time)
    parsedLyrics.value = lyricLines
  }

  const activeLineIndex = computed(() => {
    if (!currentTime.value || parsedLyrics.value.length === 0) return -1
    for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
      if (parsedLyrics.value[i].time <= (currentTime.value || 0)) return i
    }
    return -1
  })

  function scrollToActiveLine() {
    nextTick(() => {
      const container = containerRef.value
      const activeLine = lyricLineRefs.value[activeLineIndex.value]
      if (!container || !activeLine) return

      const scrollPosition =
        activeLine.offsetTop - container.clientHeight / 2 + activeLine.offsetHeight / 2
      container.scrollTo({ top: scrollPosition, behavior: 'smooth' })
    })
  }

  function updateSpacerHeight() {
    nextTick(() => {
      if (containerRef.value) spacerHeight.value = containerRef.value.clientHeight / 2
    })
  }

  watch(
    lyrics,
    (val) => {
      parseLyrics(val)
      updateSpacerHeight()
    },
    { immediate: true },
  )

  watch(activeLineIndex, scrollToActiveLine)
  onMounted(updateSpacerHeight)

  return {
    parsedLyrics,
    activeLineIndex,
    spacerHeight,
    setLyricLineRef,
  }
}
