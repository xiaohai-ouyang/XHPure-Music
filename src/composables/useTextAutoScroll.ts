import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 文本循环滚动（走马灯）组合式函数
 * 鼠标悬停时开始滚动，离开后等待当前滚动结束再停止
 * @param speed 滚动速度（像素/秒），默认 50
 */
export function useMarqueeScroll(speed = 50) {
  const containerRef = ref<HTMLElement | null>(null)
  let animationName = ''
  let observer: ResizeObserver | null = null
  let shouldStop = false // 标记是否在下一轮结束后停止

  /** 初始化动画（自动计算滚动距离与时间） */
  const initMarquee = () => {
    const el = containerRef.value
    if (!el) return

    const content = el.querySelector('.xiaoHi-marquee-content') as HTMLElement
    if (!content) return

    const contentWidth = content.scrollWidth
    const containerWidth = el.clientWidth

    // 不溢出则不动
    if (contentWidth <= containerWidth) {
      el.classList.remove('xiaoHi-scrolling')
      return
    }

    // 清除旧动画
    const styleSheet = document.styleSheets[0]
    if (animationName) {
      for (let i = styleSheet.cssRules.length - 1; i >= 0; i--) {
        const rule = styleSheet.cssRules[i]
        if (rule instanceof CSSKeyframesRule && rule.name === animationName) {
          styleSheet.deleteRule(i)
        }
      }
    }

    // 新动画名
    animationName = `marquee_${Math.random().toString(36).slice(2)}`
    const distance = contentWidth
    const duration = (distance / speed) * 1000

    // 创建 keyframes
    const keyframes = `
      @keyframes ${animationName} {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${distance}px); }
      }
    `
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length)

    // 克隆副本以实现无缝滚动
    if (!el.querySelector('.xiaoHi-clone')) {
      const clone = content.cloneNode(true) as HTMLElement
      clone.classList.add('xiaoHi-clone')
      el.appendChild(clone)
    }

    // 应用动画变量
    el.style.setProperty('--scroll-duration', `${duration}ms`)
    el.style.setProperty('--scroll-anim', animationName)
  }

  /** 开始滚动 */
  const startScroll = () => {
    const el = containerRef.value
    if (!el) return
    shouldStop = false
    el.classList.add('xiaoHi-scrolling')
  }

  /** 请求停止：将在下一轮动画结束后停止 */
  const requestStop = () => {
    shouldStop = true
  }

  /** 动画结束监听 */
  const handleAnimationIteration = () => {
    if (shouldStop) {
      const el = containerRef.value
      el?.classList.remove('xiaoHi-scrolling')
      shouldStop = false
    }
  }

  /** 清理动画 */
  const cleanup = () => {
    if (observer) observer.disconnect()
    observer = null
    const el = containerRef.value
    el?.removeEventListener('animationiteration', handleAnimationIteration)
  }

  onMounted(() => {
    const el = containerRef.value
    if (!el) return

    initMarquee()

    // 自适应监听（内容或宽度变化时重新计算）
    observer = new ResizeObserver(() => initMarquee())
    observer.observe(el)

    // 监听动画轮次
    el.addEventListener('animationiteration', handleAnimationIteration)

    // 悬停控制
    el.addEventListener('mouseenter', startScroll)
    el.addEventListener('mouseleave', requestStop)
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    containerRef,
  }
}
