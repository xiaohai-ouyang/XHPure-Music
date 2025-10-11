import { ref, computed } from 'vue'
import ColorThief from 'colorthief'
import tinycolor from 'tinycolor2'

/**
 * 从专辑封面提取主色调的组合式函数返回类型
 */
type DominantColorState = ReturnType<typeof createDominantColor>

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
  const dominantTextColor = ref<string[] | string>(['#fff', '#fff', '#fff', '#fff', '#fff'])

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
        // 从图片中提取调色板（7种主要颜色）
        const palette = colorThief.getPalette(img, 7)

        // 调整颜色亮度以确保良好的可读性
        const adjusted = palette.map((c) => {
          let color = tinycolor({ r: c[0], g: c[1], b: c[2] })
          color = color.isLight() ? color.darken(10) : color.lighten(15)
          return color.toRgb()
        })

        // 构造背景渐变色字符串
        dominantColor.value = `linear-gradient(135deg, ${adjusted
          .map((c) => `rgb(${c.r},${c.g},${c.b})`)
          .join(', ')})`

        // 计算主文本颜色
        const mainColor = adjusted[0]
        let textColor = tinycolor(mainColor)
        textColor = textColor.isLight() ? textColor.darken(10) : textColor.lighten(15)

        // 从调色板中随机选择4种颜色作为备选文本颜色
        const paletteColors = [...adjusted]
        const selectedColors: string[] = []
        for (let i = 0; i < 4; i++) {
          const randomIndex = Math.floor(Math.random() * paletteColors.length)
          const color = paletteColors.splice(randomIndex, 1)[0]
          const tColor = tinycolor(color)
          selectedColors.push(tColor.toString())
        }

        // 设置主文本颜色和备选颜色
        dominantTextColor.value = [textColor.toString(), ...selectedColors]

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
