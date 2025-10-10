import { ref, computed } from 'vue'

export function useChineseToggle(lyrics: string) {
  const removeChinese = ref(false)
  const hasChinese = computed(() => /[\u4e00-\u9fff]/.test(lyrics))
  const translationTooltip = computed(() => (removeChinese.value ? '显示中文' : '隐藏中文'))
  const toggleChinese = () => (removeChinese.value = !removeChinese.value)
  return { removeChinese, hasChinese, translationTooltip, toggleChinese }
}
