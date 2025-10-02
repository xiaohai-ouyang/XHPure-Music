import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('themeStore', () => {
  const colorMode = ref('')

  // 初始化时从 localStorage 恢复主题
  function initTheme() {
    const savedTheme = localStorage.getItem('colorMode')
    if (savedTheme) {
      colorMode.value = savedTheme
    } else {
      colorMode.value = 'system'
    }
    // 应用到 DOM
    document.documentElement.setAttribute('data-theme', colorMode.value)
  }

  function setColorMode(newTheme: string) {
    colorMode.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('colorMode', newTheme)
  }

  return {
    colorMode,
    setColorMode,
    initTheme, // 暴露初始化方法
  }
})
