import { ref } from 'vue'
import { usePlaybackQueueStore } from '@/stores/playbackQueueStores'

/**
 * useProgressBar()
 * 专门处理进度条相关逻辑的可组合函数
 * 
 * @description
 * 该组合式函数负责处理音频播放进度条的所有交互逻辑，
 * 包括点击跳转和拖拽功能。
 * 
 * @returns {Object} 包含以下属性和方法的对象：
 * - progressBar: 进度条元素的引用
 * - isDragging: 表示当前是否正在拖拽进度条的状态
 * - seekByClick: 处理点击进度条跳转的函数
 * - startDrag: 处理开始拖拽进度条的函数
 * 
 * @example
 * ```vue
 * <template>
 *   <div 
 *     ref="progressBar" 
 *     @click="seekByClick"
 *     @mousedown="startDrag"
 *   >
 *     <!-- 进度条UI -->
 *   </div>
 * </template>
 * 
 * <script setup>
 * import { useProgressBar } from '@/composables/useProgressBar'
 * 
 * const { progressBar, isDragging, seekByClick, startDrag } = useProgressBar()
 * </script>
 * ```
 */
export function useProgressBar() {
  // ======= 进度条交互状态 =======
  const progressBar = ref<HTMLElement | null>(null)
  const isDragging = ref(false)
  
  const playbackQueueStore = usePlaybackQueueStore()

  // ======= 音频控制引用 =======
  const getAudioElement = (): HTMLAudioElement | null => {
    return document.querySelector('audio')
  }

  /**
   * 处理点击进度条跳转功能
   * @param event 鼠标点击事件
   */
  const seekByClick = (event: MouseEvent) => {
    const bar = progressBar.value
    if (!bar) return
    
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const audio = getAudioElement()
    
    if (!audio) return
    audio.currentTime = ratio * playbackQueueStore.currentPlayingDuration
  }

  /**
   * 处理开始拖拽进度条功能
   */
  const startDrag = () => {
    isDragging.value = true
    const audio = getAudioElement()
    if (!audio) return

    const onMove = (e: MouseEvent) => {
      const bar = progressBar.value
      if (!bar) return
      
      const rect = bar.getBoundingClientRect()
      const ratio = Math.min(Math.max(e.clientX - rect.left, 0), rect.width) / rect.width
      audio.currentTime = ratio * playbackQueueStore.currentPlayingDuration
    }
    
    const onUp = () => {
      isDragging.value = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ======= 返回可用接口 =======
  return {
    // 进度条控制
    progressBar,
    isDragging,
    seekByClick,
    startDrag
  }
}