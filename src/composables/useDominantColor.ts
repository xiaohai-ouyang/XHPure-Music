import { ref, computed } from 'vue'
import ColorThief from 'colorthief'
import tinycolor from 'tinycolor2'

/**
 * 从专辑封面提取主色调的组合式函数返回类型
 */
type DominantColorState = ReturnType<typeof createDominantColor>

/**
 * RGB颜色类型
 */
type RGB = { r: number; g: number; b: number }

/**
 * HSL颜色类型
 */
type HSL = { h: number; s: number; l: number }

/**
 * RGB转HSL
 */
function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h, s, l }
}

/**
 * 颜色质量得分
 */
type ColorScore = {
  color: RGB
  score: number
}

/**
 * 计算两个RGB颜色之间的对比度（基于WCAG 2.1标准）
 * @param fg 前景色
 * @param bg 背景色
 * @returns 对比度比值 (1-21)
 */
function calculateContrast(fg: RGB, bg: RGB): number {
  function luminance(rgb: RGB): number {
    const a = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }

  const lum1 = luminance(fg)
  const lum2 = luminance(bg)
  const brighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (brighter + 0.05) / (darker + 0.05)
}

/**
 * 计算饱和度得分 (0-100)
 * 0.3-0.7 为最佳区间，使用正态分布得分
 */
function calculateSaturationScore(hsl: { h: number; s: number; l: number }): number {
  const s = hsl.s
  const ideal = 0.5
  const stdDev = 0.2

  const diff = s - ideal
  const score = Math.exp(-(diff * diff) / (2 * stdDev * stdDev)) * 100
  return Math.min(100, Math.max(0, score))
}

/**
 * 计算亮度适合度得分 (0-100)
 * 0.2-0.8 为最佳区间，避免过亮或过暗
 */
function calculateLightnessScore(hsl: { h: number; s: number; l: number }): number {
  const l = hsl.l
  if (l < 0.2 || l > 0.8) return 0
  if (l >= 0.3 && l <= 0.7) return 100

  const idealRange = 0.23
  const nearestBoundary = l < 0.3 ? 0.2 : 0.8
  const score =
    100 - (Math.abs(l - nearestBoundary) / (idealRange - Math.abs(l - nearestBoundary))) * 100
  return Math.max(0, score)
}

/**
 * 计算颜色综合质量得分
 * @param color RGB颜色
 * @param backgroundColors 背景颜色数组（用于计算对比度）
 * @returns 颜色得分对象
 */
function calculateColorScore(color: RGB, backgroundColors: RGB[]): ColorScore {
  const hsl = rgbToHsl(color)

  const contrastScore = Math.min(
    100,
    ((calculateContrast(color, backgroundColors[0] || { r: 34, g: 34, b: 34 }) - 1) / 6) * 100,
  )
  const saturationScore = calculateSaturationScore(hsl)
  const lightnessScore = calculateLightnessScore(hsl)

  const score = contrastScore * 0.5 + saturationScore * 0.3 + lightnessScore * 0.2

  return {
    color,
    score,
  }
}

// 单例模式，确保整个应用中只创建一次
let singleton: DominantColorState | null = null

/**
 * 创建主色调管理器
 * 负责从专辑封面图片提取主色调并生成相应的渐变背景和文本颜色
 * @returns 包含颜色相关状态和方法的对象
 */
function createDominantColor() {
  // 主背景渐变色
  const dominantColor = ref('linear-gradient(135deg, #222, #000)')
  // 主要文本颜色数组
  const dominantTextColor = ref<string[] | string>(['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'])

  // 颜色缓存，避免重复计算相同封面的颜色
  const colorCache = new Map<string, { color: string; textColors: string[] }>()

  // 本地存储中选中颜色索引的键名
  const SELECTED_COLOR_KEY = 'playback_selected_color_index'

  // 当前选中的颜色索引
  const selectedColorIndex = ref(Number(localStorage.getItem(SELECTED_COLOR_KEY)) || 0)

  /**
   * 从专辑封面URL提取主色调并生成背景渐变色和文本颜色
   * @param coverUrl 专辑封面图片URL
   */
  const updateBackgroundFromCover = (coverUrl: string) => {
    // 如果没有封面URL则直接返回
    if (!coverUrl) return

    // 如果已缓存该封面的颜色信息，则直接使用缓存
    if (colorCache.has(coverUrl)) {
      const cached = colorCache.get(coverUrl)!
      dominantColor.value = cached.color
      dominantTextColor.value = cached.textColors
      return
    }

    // 创建图片对象用于颜色提取
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = coverUrl

    // 图片加载完成后处理
    img.onload = () => {
      const colorThief = new ColorThief()
      try {
        // 从图片中提取调色板（12种主要颜色，比之前更多）
        const palette = colorThief.getPalette(img, 12)

        // 调整颜色亮度以确保良好的可读性
        const adjusted = palette.map((c) => {
          let color = tinycolor({ r: c[0], g: c[1], b: c[2] })
          color = color.isLight() ? color.darken(10) : color.lighten(15)
          return color.toRgb()
        })

        // 构造背景渐变色字符串（使用前7个颜色）
        const gradientColors = adjusted.slice(0, 7)
        dominantColor.value = `linear-gradient(135deg, ${gradientColors
          .map((c) => `rgb(${c.r},${c.g},${c.b})`)
          .join(', ')})`

        // 为所有颜色计算质量得分
        const colorScores = adjusted.map((c) => calculateColorScore(c, gradientColors))

        // 按得分排序，选择得分最高的颜色（最佳质量）
        const sortedColors = colorScores.sort((a, b) => b.score - a.score)

        // 选择前4个最佳颜色作为备选文本颜色
        const selectedColors: string[] = []
        for (let i = 0; i < Math.min(4, sortedColors.length); i++) {
          const color = sortedColors[i].color
          const tColor = tinycolor(color)
          selectedColors.push(tColor.toString())
        }

        // 设置备选颜色，添加默认的白色选项
        dominantTextColor.value = [...selectedColors, '#fff']

        // 将计算结果缓存起来
        colorCache.set(coverUrl, {
          color: dominantColor.value,
          textColors: dominantTextColor.value as string[],
        })
      } catch {
        // 出现错误时使用默认颜色
        dominantColor.value = 'linear-gradient(135deg, #222, #000)'
        dominantTextColor.value = ['#fff', '#fff', '#fff', '#fff', '#fff']
      }
    }
  }

  // 当前封面URL
  const coverUrl = ref<string | null>(null)

  /**
   * 设置当前专辑封面
   * @param url 专辑封面图片URL
   */
  const setCover = (url: string | null) => {
    const prev = coverUrl.value
    coverUrl.value = url

    // 如果是新封面，则重置选中的颜色索引
    if (url && url !== prev) {
      selectedColorIndex.value = 0
      try {
        localStorage.setItem(SELECTED_COLOR_KEY, '0')
      } catch {
        // 忽略存储错误
      }
    }

    // 如果有URL则更新背景色
    if (url) updateBackgroundFromCover(url)
  }

  // 背景样式计算属性
  const backgroundStyle = computed(() => ({
    backgroundImage: coverUrl.value ? `url(${coverUrl.value})` : '',
  }))

  /**
   * 选择特定颜色索引
   * @param index 颜色索引
   */
  const selectColor = (index: number) => {
    selectedColorIndex.value = index
    try {
      localStorage.setItem(SELECTED_COLOR_KEY, String(index))
    } catch {
      // 忽略存储错误
    }
  }

  // 文本颜色数组计算属性
  const textColors = computed(() => {
    const colors = dominantTextColor.value
    return Array.isArray(colors) ? colors : [colors]
  })

  // 当前选中的文本颜色计算属性
  const currentTextColor = computed(() => {
    const colors = dominantTextColor.value
    const arr = Array.isArray(colors) ? colors : [colors]
    return arr[selectedColorIndex.value] || '#fff'
  })

  // 页面样式计算属性
  const pageStyle = computed(() => ({
    background: dominantColor.value,
    color: currentTextColor.value,
  }))

  // 导出所有状态和方法
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

/**
 * 获取主色调管理器单例
 * @returns 主色调管理器实例
 */
export function useDominantColor() {
  if (!singleton) singleton = createDominantColor()
  return singleton
}
