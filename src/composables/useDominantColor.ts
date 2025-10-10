import { ref } from 'vue'
import ColorThief from 'colorthief'
import tinycolor from 'tinycolor2'

export function useDominantColor() {
  const dominantColor = ref('linear-gradient(135deg, #222, #000)')
  const dominantTextColor = ref('#fff')

  const updateBackgroundFromCover = (coverUrl: string) => {
    if (!coverUrl) return
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
        dominantColor.value = `linear-gradient(135deg, ${adjusted.map((c) => `rgb(${c.r},${c.g},${c.b})`).join(', ')})`
        const mainColor = adjusted[0]
        let textColor = tinycolor(mainColor)
        textColor = textColor.isLight() ? textColor.darken(10) : textColor.lighten(15)
        dominantTextColor.value = textColor.toString()
      } catch {
        dominantColor.value = 'linear-gradient(135deg, #222, #000)'
        dominantTextColor.value = '#fff'
      }
    }
  }

  return { dominantColor, dominantTextColor, updateBackgroundFromCover }
}
