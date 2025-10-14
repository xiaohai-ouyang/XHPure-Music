export function heightTransition(el: { value: HTMLElement }, show: boolean) {
  if (!el?.value) return

  const element = el.value

  // 清除旧的过渡，避免冲突
  element.style.transition = 'none'

  element.style.height = '0px'
  if (show) {
    // 强制触发一次重绘
    void element.offsetHeight

    // 设置目标高度
    const targetHeight = element.scrollHeight + 'px'

    // 开始过渡
    element.style.transition = 'height 0.2s ease-in'
    element.style.height = targetHeight

    element.addEventListener(
      'transitionend',
      () => {
        element.style.height = 'auto'
      },
      { once: true },
    )
  } else {
    const currentHeight = element.scrollHeight + 'px'

    element.style.height = currentHeight

    void element.offsetHeight

    element.style.transition = 'height 0.2s ease-out'
    element.style.height = '0px'

    element.addEventListener(
      'transitionend',
      () => {
        element.style.height = '0px'
      },
      { once: true },
    )
  }
}
