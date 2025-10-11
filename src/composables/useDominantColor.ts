import { ref, computed } from 'vue'
import ColorThief from 'colorthief'
import tinycolor from 'tinycolor2'

type DominantColorState = ReturnType<typeof createDominantColor>

let singleton: DominantColorState | null = null

function createDominantColor() {
  const dominantColor = ref('linear-gradient(135deg, #222, #000)')
  const dominantTextColor = ref<string[] | string>(['#fff', '#fff', '#fff', '#fff', '#fff'])

  const colorCache = new Map<string, { color: string; textColors: string[] }>()

  const SELECTED_COLOR_KEY = 'playback_selected_color_index'
  const selectedColorIndex = ref(Number(localStorage.getItem(SELECTED_COLOR_KEY)) || 0)

  const updateBackgroundFromCover = (coverUrl: string) => {
    if (!coverUrl) return
    if (colorCache.has(coverUrl)) {
      const cached = colorCache.get(coverUrl)!
      dominantColor.value = cached.color
      dominantTextColor.value = cached.textColors
      return
    }
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = coverUrl
    img.onload = () => {
      const colorThief = new ColorThief()
      try {
        const palette = colorThief.getPalette(img, 7)
        const adjusted = palette.map((c) => {
          let color = tinycolor({ r: c[0], g: c[1], b: c[2] })
          color = color.isLight() ? color.darken(10) : color.lighten(15)
          return color.toRgb()
        })
        dominantColor.value = `linear-gradient(135deg, ${adjusted
          .map((c) => `rgb(${c.r},${c.g},${c.b})`)
          .join(', ')})`
        const mainColor = adjusted[0]
        let textColor = tinycolor(mainColor)
        textColor = textColor.isLight() ? textColor.darken(10) : textColor.lighten(15)

        const paletteColors = [...adjusted]
        const selectedColors: string[] = []
        for (let i = 0; i < 4; i++) {
          const randomIndex = Math.floor(Math.random() * paletteColors.length)
          const color = paletteColors.splice(randomIndex, 1)[0]
          const tColor = tinycolor(color)
          selectedColors.push(tColor.toString())
        }

        dominantTextColor.value = [textColor.toString(), ...selectedColors]

        colorCache.set(coverUrl, {
          color: dominantColor.value,
          textColors: dominantTextColor.value as string[],
        })
      } catch {
        dominantColor.value = 'linear-gradient(135deg, #222, #000)'
        dominantTextColor.value = ['#fff', '#fff', '#fff', '#fff', '#fff']
      }
    }
  }

  const coverUrl = ref<string | null>(null)

  const setCover = (url: string | null) => {
    const prev = coverUrl.value
    coverUrl.value = url

    if (url && url !== prev) {
      selectedColorIndex.value = 0
      try {
        localStorage.setItem(SELECTED_COLOR_KEY, '0')
      } catch {
        // ignore
      }
    }
    if (url) updateBackgroundFromCover(url)
  }

  const backgroundStyle = computed(() => ({
    backgroundImage: coverUrl.value ? `url(${coverUrl.value})` : '',
  }))

  const selectColor = (index: number) => {
    selectedColorIndex.value = index
    try {
      localStorage.setItem(SELECTED_COLOR_KEY, String(index))
    } catch {
      // ignore
    }
  }

  const textColors = computed(() => {
    const colors = dominantTextColor.value
    return Array.isArray(colors) ? colors : [colors]
  })

  const currentTextColor = computed(() => {
    const colors = dominantTextColor.value
    const arr = Array.isArray(colors) ? colors : [colors]
    return arr[selectedColorIndex.value] || '#fff'
  })

  const pageStyle = computed(() => ({
    background: dominantColor.value,
    color: currentTextColor.value,
  }))

  return {
    dominantColor,
    dominantTextColor,
    updateBackgroundFromCover,
    selectedColorIndex,
    selectColor,
    textColors,
    currentTextColor,
    pageStyle,
    coverUrl,
    setCover,
    backgroundStyle,
  }
}

export function useDominantColor() {
  if (!singleton) singleton = createDominantColor()
  return singleton
}
