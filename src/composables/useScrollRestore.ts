import { nextTick, onBeforeUnmount, onMounted, type Ref } from 'vue'
import { useRoute } from 'vue-router'

interface Options {
  containerRef: Ref<HTMLElement | null>
  key?: string
}

const scrollPositions = new Map<string, number>()

function saveScrollPosition(container: HTMLElement | null, key: string) {
  if (container) {
    scrollPositions.set(key, container.scrollTop)
  }
}

function restoreScrollPosition(container: HTMLElement | null, key: string) {
  if (!container) return

  const saved = scrollPositions.get(key)
  if (saved !== undefined) {
    container.scrollTop = saved
  }
}

export function useScrollRestore({ containerRef, key }: Options) {
  const route = useRoute()
  const scrollKey = key || route.fullPath

  onMounted(() => {
    nextTick(() => {
      restoreScrollPosition(containerRef.value, scrollKey)
    })
  })

  onBeforeUnmount(() => {
    saveScrollPosition(containerRef.value, scrollKey)
  })

  return {
    restoreScroll: () => {
      restoreScrollPosition(containerRef.value, scrollKey)
    }
  }
}
