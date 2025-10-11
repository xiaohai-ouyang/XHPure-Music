import { ref, computed, watch, nextTick, onMounted, type Ref } from 'vue'
import { useMusicMetaStore } from '@/stores/musicMetaStores'

export interface LyricLine {
  time: number
  text: string // 原始文本
  displayText: string // 显示文本（根据removeChinese决定是否移除中文）
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
  const musicStore = useMusicMetaStore()

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

    let lastColonLineIndex = -1

    // 找到最后一行冒号位置
    lines.forEach((line, index) => {
      const lyricText = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim()
      if (/:|：/.test(lyricText)) lastColonLineIndex = index
    })

    // 获取当前正在播放的音乐
    const currentMusic = musicStore.musicList.find((music) => music.isPlaying)

    // 是否应该移除中文：当用户开启 removeChinese 时替换中文
    const shouldRemoveChinese = removeChinese?.value

    lines.forEach((line, index) => {
      const timeMatch = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\]/)
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1])
        const seconds = parseInt(timeMatch[2])
        const milliseconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0
        const time = minutes * 60 + seconds + milliseconds / 1000

        const originalText = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim()

        // 根据removeChinese决定显示文本
        let displayText = originalText
        if (shouldRemoveChinese && index > lastColonLineIndex) {
          displayText = originalText.replace(/[\u4e00-\u9fff]+/g, '')
        }

        lyricLines.push({
          time,
          text: originalText, // 始终保存原始文本
          displayText, // 根据条件决定显示的文本
          languages: detectLanguages(originalText),
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

  // 是否为双语歌词（直接使用musicPicker中判断的结果）
  const isBilingual = computed(() => {
    const currentMusic = musicStore.musicList.find((music) => music.isPlaying)
    return !!currentMusic?.isBilingual
  })

  // 是否应该显示"去中文"按钮
  const showRemoveChineseButton = computed(() => {
    const currentMusic = musicStore.musicList.find((music) => music.isPlaying)
    return !!currentMusic?.isBilingual
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
    showRemoveChineseButton,
  }
}
