import { ref, computed, watch, nextTick, onMounted, type Ref } from 'vue'

export interface LyricLine {
  time: number
  text: string
  languages?: string[]
}

/**
 * LRC歌词解析和显示组合式函数
 * @param lyrics - 原始歌词文本的响应式引用
 * @param currentTime - 当前播放时间的响应式引用
 * @param containerRef - 歌词容器DOM元素的响应式引用
 * @param removeChinese - 是否去掉中文
 */
export function useLrcParser(
  lyrics: Ref<string>,
  currentTime: Ref<number | undefined>,
  containerRef: Ref<HTMLElement | null>,
  removeChinese?: Ref<boolean>,
) {
  const lyricLineRefs = ref<HTMLElement[]>([])
  const spacerHeight = ref(250)
  const parsedLyrics = ref<LyricLine[]>([])

  function setLyricLineRef(el: Element | null, index: number) {
    if (el) lyricLineRefs.value[index] = el as HTMLElement
  }

  function detectLanguages(text: string): string[] {
    const langSet = new Set<string>()
    if (/[\u4e00-\u9fff]/.test(text)) langSet.add('zh')
    if (/[A-Za-z]/.test(text)) langSet.add('en')
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) langSet.add('ja')
    if (/[\uac00-\ud7af]/.test(text)) langSet.add('ko')
    return Array.from(langSet)
  }

  function parseLyrics(text: string) {
    if (!text) {
      parsedLyrics.value = []
      return
    }

    const lines = text.split('\n')
    const lyricLines: LyricLine[] = []

    let chineseLineCount = 0
    let otherLineCount = 0
    let lastColonLineIndex = -1

    // 第一次统计行数，并找到最后一行冒号位置
    lines.forEach((line, index) => {
      const lyricText = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim()
      const langs = detectLanguages(lyricText)
      if (langs.includes('zh')) chineseLineCount++
      if (langs.some((l) => l !== 'zh')) otherLineCount++
      if (/:|：/.test(lyricText)) lastColonLineIndex = index
    })

    // 只有中英文都超过20行时，才算双语歌词
    const isTrueBilingual = chineseLineCount >= 20 && otherLineCount >= 20

    // 是否应该移除中文
    const shouldRemoveChinese = removeChinese?.value && isTrueBilingual

    lines.forEach((line, index) => {
      const timeMatch = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\]/)
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1])
        const seconds = parseInt(timeMatch[2])
        const milliseconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0
        const time = minutes * 60 + seconds + milliseconds / 1000

        let lyricText = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim()

        // 只有在最后一个冒号行之后才会移除中文
        if (shouldRemoveChinese && index > lastColonLineIndex) {
          lyricText = lyricText.replace(/[\u4e00-\u9fff]+/g, '')
        }

        lyricLines.push({
          time,
          text: lyricText,
          languages: detectLanguages(lyricText),
        })
      }
    })

    lyricLines.sort((a, b) => a.time - b.time)
    parsedLyrics.value = lyricLines
  }

  // 当前行索引
  const activeLineIndex = computed(() => {
    if (!currentTime.value || parsedLyrics.value.length === 0) return -1
    for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
      if (parsedLyrics.value[i].time <= (currentTime.value || 0)) return i
    }
    return -1
  })

  // 滚动到当前行
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

  // 是否为双语歌词
  const isBilingual = computed(() => {
    // 通过 parseLyrics 时统计到的 bilingual 规则
    let zhCount = 0
    let enCount = 0
    parsedLyrics.value.forEach((line) => {
      if (line.languages?.includes('zh')) zhCount++
      if (line.languages?.includes('en')) enCount++
    })
    return zhCount >= 20 && enCount >= 20
  })

  // 监听歌词变化
  watch(
    lyrics,
    (val) => {
      parseLyrics(val)
      updateSpacerHeight()
    },
    { immediate: true },
  )

  if (removeChinese) {
    watch(removeChinese, () => {
      parseLyrics(lyrics.value)
    })
  }

  watch(activeLineIndex, scrollToActiveLine)
  onMounted(updateSpacerHeight)

  return {
    parsedLyrics,
    activeLineIndex,
    spacerHeight,
    setLyricLineRef,
    isBilingual,
  }
}
